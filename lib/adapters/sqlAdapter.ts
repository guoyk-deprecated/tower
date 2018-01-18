/**
 * sqlAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import mysql = require("mysql");
import {IAdapter, IConfigSource} from "../interface";

/**
 * result of sql query
 */
export interface ISqlQueryResult {
  /** sql query results */
  rows: any[];
  /** insertIds */
  insertIds: number[];
  /** affectedRows */
  affectedRows: number;
  /** changedRows */
  changedRows: number;
}

export interface ISqlExecuteResult {
  results?: any;
  fields?: mysql.FieldInfo[];
}

/**
 * option of sql query
 */
export interface ISqlQueryOption {
  /** use the master node if this adapter supports replica */
  master?: boolean;
  /** id to lookup shard if this adapter supports sharding */
  shardOf?: number | string;
}

export enum SqlAdapterType {
  Single,
  Replica,
  Shard,
}

/**
 * option to construct a SqlAdapter
 */
export interface ISqlAdapterOption {
  configSource: IConfigSource;
  key: string;
  type: SqlAdapterType;
}

export interface ISqlReplicaConfig {
  master: string;
  slaves: string[];
}

export interface ISqlShardConfig {
  members: string[];
  ranges: ISqlShardRange[];
}

export interface ISqlShardRange {
  from?: number;
  to?: number;
}

function validateSqlConfig(
    key: string, type: SqlAdapterType, configSource: IConfigSource) {
  if (typeof key !== "string") {
    throw new Error(`key of sql config must be string`);
  }
  switch (type) {
    case SqlAdapterType.Single: {
      const config = configSource.get(key);
      if (typeof config !== "object") {
        throw new Error(`invalid sql config for key ${key}`);
      }
      return;
    }
    case SqlAdapterType.Replica: {
      const config = configSource.get(key) as ISqlReplicaConfig;
      if (typeof config !== "object" || !config.master) {
        throw new Error(`invalid replica sql config for key ${key}`);
      }
      if (config.slaves && Array.isArray(config.slaves)) {
        for (const slaveKey of config.slaves) {
          validateSqlConfig(slaveKey, SqlAdapterType.Single, configSource);
        }
      }
      return;
    }
    case SqlAdapterType.Shard: {
      const config = configSource.get(key) as ISqlShardConfig;
      if (typeof config !== "object" || !Array.isArray(config.members) || !Array.isArray(config.ranges)) {
        throw new Error(`invalid shard sql config for key ${key}`);
      }
      for (const replicaKey of config.members) {
        validateSqlConfig(replicaKey, SqlAdapterType.Replica, configSource);
      }
      for (const shard of config.ranges) {
        if (typeof shard !== "object") {
          throw new Error("invalid shard object found in shard config for key ${key}");
        }
      }
      return;
    }
    default:
      throw new Error(`invalid sql adapter type ${type}`);
  }
}

function findShardKeyById(id: number, config: ISqlShardConfig): string {
  for (let i = 0; i < config.ranges.length; i ++) {
    const shard = config.ranges[i];
    if (shard.from != null) {
      if (id < shard.from) {
        continue;
      }
    }
    if (shard.to != null) {
      if (id >= shard.to) {
        continue;
      }
    }
    return config.members[i];
  }

  throw new Error(`shard not found for ID=${id}`);
}

function compactExecutionResults(results: ISqlExecuteResult[]): ISqlQueryResult {
  const ret: ISqlQueryResult =  {
    affectedRows: 0,
    changedRows: 0,
    insertIds: [],
    rows: [],
  };
  for (const result of results) {
    if (Array.isArray(result.results)) {
      ret.rows = ret.rows.concat(result.results);
    }
    if (result.results.insertId) {
      ret.insertIds.push(result.results.insertId);
    }
    if (result.results.affectedRows) {
      ret.affectedRows += result.results.affectedRows;
    }
    if (result.results.changedRows) {
      ret.changedRows += result.results.changedRows;
    }
  }
  return ret;
}

export class SqlAdapter implements IAdapter {
  public readonly key: string;
  public readonly configSource: IConfigSource;
  public readonly type: SqlAdapterType;
  private seqId: number;
  private conns: Map<string, mysql.Connection>;

  constructor(option: ISqlAdapterOption) {
    this.key = option.key;
    this.configSource = option.configSource;
    this.type = option.type;
    this.seqId = 0;
    this.conns = new Map();
    validateSqlConfig(this.key, this.type, this.configSource);
  }

  /**
   * execut sql query
   * @param sql sql string
   * @param args arguments
   * @param option query option
   */
  public async query(sql: string, args?: any, option?: ISqlQueryOption): Promise<ISqlQueryResult> {
    const conns = this.getConnections(option);
    const results = [];
    for (const conn of conns) {
      results.push(await this.executeSql(conn, sql, args, option));
    }
    return compactExecutionResults(results);
  }

  /**
   * end and clean all internal connections
   */
  public dispose() {
    for (const conn of this.conns.values()) {
      conn.end();
    }
    this.conns.clear();
  }

  private async executeSql(
    conn: mysql.Connection, sql: string, args?: any, optons?: ISqlQueryOption): Promise<ISqlExecuteResult> {
    return new Promise<ISqlExecuteResult>((resolve, reject) => {
      conn.query(sql, args, (error: mysql.MysqlError | null, results?: any, fields?: mysql.FieldInfo[]) => {
        if (error == null) {
          resolve({fields, results});
        } else {
          reject(error);
        }
      });
    });
  }

  private getConnections(option?: ISqlQueryOption): mysql.Connection[] {
    switch (this.type) {
      case SqlAdapterType.Single:
        return [this.getConnectionByKey(this.key)];
      case SqlAdapterType.Replica:
        return [this.getReplicaConnectionByKey(this.key, option)];
      case SqlAdapterType.Shard:
        return this.getShardConnectionsByKey(this.key, option);
      default:
        throw new Error(`invalid sql adapter type ${this.type}`);
    }
  }

  private getShardConnectionsByKey(key: string, option?: ISqlQueryOption): mysql.Connection[] {
    const config = this.configSource.get(key) as ISqlShardConfig;
    if (option == null || option.shardOf == null) {
      throw new Error(`option.shardOf not set for shard mysql adapter`);
    }
    if (typeof option.shardOf === "number") {
      const replicaKey = findShardKeyById(option.shardOf, config);
      return [this.getReplicaConnectionByKey(replicaKey, option)];
    } else if (option.shardOf === "all") {
      return config.members.map((replicaKey) => this.getReplicaConnectionByKey(replicaKey, option));
    } else {
      throw new Error(`invalid parameter set to queryOption.shardOf`);
    }
  }

  private getReplicaConnectionByKey(key: string, option?: ISqlQueryOption): mysql.Connection {
    const config = this.configSource.get(key) as ISqlReplicaConfig;
    // use master if query option specified or no slave specified
    const master = (option && option.master) || !Array.isArray(config.slaves) || config.slaves.length === 0;
    if (master) {
      return this.getConnectionByKey(config.master);
    } else {
      return this.getConnectionByKey(config.slaves[this.seqId % config.slaves.length]);
    }
  }

  private removeConnection(conn: mysql.Connection) {
    let key: string|null = null;
    for (const entry of this.conns.entries()) {
      if (entry[1] === conn) {
        key = entry[0];
        break;
      }
    }
    if (key) {
      this.conns.delete(key);
    }
  }

  private getConnectionByKey(key: string): mysql.Connection {
    this.seqId++;
    let conn = this.conns.get(key);
    if (!conn) {
      const config = this.configSource.get(key);
      conn = mysql.createConnection(config);
      conn.on("end", () => {
        this.removeConnection(conn!);
      });
      conn.on("error", (e: mysql.MysqlError) => {
        if (e.fatal) {
          this.removeConnection(conn!);
        }
      });
      this.conns.set(key, conn);
    }
    return conn;
  }

}
