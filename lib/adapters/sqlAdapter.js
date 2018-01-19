"use strict";
/**
 * sqlAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
var SqlAdapterType;
(function (SqlAdapterType) {
    SqlAdapterType[SqlAdapterType["Single"] = 0] = "Single";
    SqlAdapterType[SqlAdapterType["Replica"] = 1] = "Replica";
    SqlAdapterType[SqlAdapterType["Shard"] = 2] = "Shard";
})(SqlAdapterType = exports.SqlAdapterType || (exports.SqlAdapterType = {}));
function validateSqlConfig(key, type, configStore) {
    if (typeof key !== "string") {
        throw new Error(`key of sql config must be string`);
    }
    switch (type) {
        case SqlAdapterType.Single: {
            const config = configStore.get(key);
            if (typeof config !== "object") {
                throw new Error(`invalid sql config for key ${key}`);
            }
            return;
        }
        case SqlAdapterType.Replica: {
            const config = configStore.get(key);
            if (typeof config !== "object" || !config.master) {
                throw new Error(`invalid replica sql config for key ${key}`);
            }
            if (config.slaves && Array.isArray(config.slaves)) {
                for (const slaveKey of config.slaves) {
                    validateSqlConfig(slaveKey, SqlAdapterType.Single, configStore);
                }
            }
            return;
        }
        case SqlAdapterType.Shard: {
            const config = configStore.get(key);
            if (typeof config !== "object" || !Array.isArray(config.members) || !Array.isArray(config.ranges)) {
                throw new Error(`invalid shard sql config for key ${key}`);
            }
            for (const replicaKey of config.members) {
                validateSqlConfig(replicaKey, SqlAdapterType.Replica, configStore);
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
function findShardKeyById(id, config) {
    for (let i = 0; i < config.ranges.length; i++) {
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
        return config.members[i % config.members.length];
    }
    throw new Error(`shard not found for ID=${id}`);
}
function compactExecutionResults(results) {
    const ret = {
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
class SqlAdapter {
    constructor(option) {
        this.key = option.key;
        this.configStore = option.configStore;
        this.type = option.type;
        this.seqId = 0;
        this.conns = new Map();
        validateSqlConfig(this.key, this.type, this.configStore);
    }
    /**
     * execut sql query
     * @param sql sql string
     * @param args arguments
     * @param option query option
     */
    async query(sql, args, option) {
        const conns = this.getConnections(option);
        const results = [];
        for (const conn of conns) {
            results.push(await this.executeSql(conn, sql, args, option));
        }
        return compactExecutionResults(results);
    }
    /**
     * execute sql query mutiple times and returns a map with id => object
     * @param sql sql query like `SELECT a AS A FROM table_a WHERE id = ? LIMIT 1` with 1 single parameter
     * @param ids set of ids
     * @param option
     */
    async queryMap(sql, ids, option) {
        const idColumn = (option && option.idColumn) ? option.idColumn : "id";
        const result = new Map();
        for (const id of ids) {
            if (option) {
                // assign shardOf automatically
                option.shardOf = option.shardOf || Number(id) || "all";
            }
            const singleResult = await this.query(sql, [id], option);
            for (const row of singleResult.rows) {
                if (row[idColumn]) {
                    result.set(String(row[idColumn]), row);
                }
            }
        }
        return result;
    }
    /**
     * get affected sql connections
     *
     * @param option query option
     */
    getConnections(option) {
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
    /**
     * end and clean all internal connections
     */
    dispose() {
        for (const conn of this.conns.values()) {
            conn.end();
        }
        this.conns.clear();
    }
    async executeSql(conn, sql, args, optons) {
        return new Promise((resolve, reject) => {
            conn.query(sql, args, (error, results, fields) => {
                if (error == null) {
                    resolve({ fields, results });
                }
                else {
                    reject(error);
                }
            });
        });
    }
    getShardConnectionsByKey(key, option) {
        const config = this.configStore.get(key);
        if (option == null || option.shardOf == null) {
            throw new Error(`option.shardOf not set for shard mysql adapter`);
        }
        if (typeof option.shardOf === "number") {
            const replicaKey = findShardKeyById(option.shardOf, config);
            return [this.getReplicaConnectionByKey(replicaKey, option)];
        }
        else if (option.shardOf === "all") {
            return config.members.map((replicaKey) => this.getReplicaConnectionByKey(replicaKey, option));
        }
        else {
            throw new Error(`invalid parameter set to queryOption.shardOf`);
        }
    }
    getReplicaConnectionByKey(key, option) {
        const config = this.configStore.get(key);
        // use master if query option specified or no slave specified
        const master = (option && option.master) || !Array.isArray(config.slaves) || config.slaves.length === 0;
        if (master) {
            return this.getConnectionByKey(config.master);
        }
        else {
            return this.getConnectionByKey(config.slaves[this.seqId % config.slaves.length]);
        }
    }
    removeConnection(conn) {
        let key = null;
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
    getConnectionByKey(key) {
        this.seqId++;
        let conn = this.conns.get(key);
        if (!conn) {
            const config = this.configStore.get(key);
            conn = mysql.createConnection(config);
            conn.on("end", () => {
                this.removeConnection(conn);
            });
            conn.on("error", (e) => {
                if (e.fatal) {
                    this.removeConnection(conn);
                }
            });
            this.conns.set(key, conn);
        }
        return conn;
    }
}
exports.SqlAdapter = SqlAdapter;
