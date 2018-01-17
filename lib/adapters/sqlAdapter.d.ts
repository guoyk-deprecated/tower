/**
 * sqlAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import mysql = require("mysql");
import { IAdapter, IConfigSource } from "../interface";
/**
 * result of sql query
 */
export interface ISqlQueryResult {
    /** sql query results */
    results: any;
    /** extra */
    fields: mysql.FieldInfo[];
}
/**
 * option of sql query
 */
export interface ISqlQueryOption {
    /** use the master node if this adapter supports replica */
    master?: boolean;
    /** id to lookup shard if this adapter supports sharding */
    shardOf?: number;
}
export declare enum SqlAdapterType {
    Single = 0,
    Replica = 1,
    Shard = 2,
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
export declare class SqlAdapter implements IAdapter {
    readonly key: string;
    readonly configSource: IConfigSource;
    readonly type: SqlAdapterType;
    private seqId;
    private conns;
    constructor(option: ISqlAdapterOption);
    /**
     * execut sql query
     * @param sql sql string
     * @param args arguments
     * @param option query option
     */
    query(sql: string, args?: any, option?: ISqlQueryOption): Promise<ISqlQueryResult>;
    /**
     * end and clean all internal connections
     */
    dispose(): void;
    private getConnection(option?);
    private getShardConnectionByKey(key, option?);
    private getReplicaConnectionByKey(key, option?);
    private removeConnection(conn);
    private getConnectionByKey(key);
}
