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
function validateSqlConfig(key, type, configSource) {
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
            const config = configSource.get(key);
            if (typeof config !== "object" || !config.master) {
                throw new Error(`invalid replica sql config for key ${key}`);
            }
            if (config.slaves && Array.isArray(config.slaves)) {
                for (const slaveKey of config.slaves) {
                    validateSqlConfig(slaveKey, SqlAdapterType.Single, configSource);
                }
            }
        }
        case SqlAdapterType.Shard: {
            const config = configSource.get(key);
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
        return config.members[i];
    }
    throw new Error(`shard not found for ID=${id}`);
}
class SqlAdapter {
    constructor(option) {
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
    async query(sql, args, option) {
        const conn = this.getConnection(option);
        return new Promise((resolve, reject) => {
            conn.query(sql, args, (error, results, fields) => {
                if (error == null) {
                    resolve({
                        fields: fields || [],
                        results: results || [],
                    });
                }
                else {
                    reject(error);
                }
            });
        });
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
    getConnection(option) {
        switch (this.type) {
            case SqlAdapterType.Single:
                return this.getConnectionByKey(this.key);
            case SqlAdapterType.Replica:
                return this.getReplicaConnectionByKey(this.key, option);
            case SqlAdapterType.Shard:
                return this.getShardConnectionByKey(this.key, option);
            default:
                throw new Error(`invalid sql adapter type ${this.type}`);
        }
    }
    getShardConnectionByKey(key, option) {
        const config = this.configSource.get(key);
        if (option == null || option.shardOf == null) {
            throw new Error(`option.shardOf not set for shard mysql adapter`);
        }
        const replicaKey = findShardKeyById(option.shardOf, config);
        return this.getReplicaConnectionByKey(replicaKey, option);
    }
    getReplicaConnectionByKey(key, option) {
        const config = this.configSource.get(key);
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
            const config = this.configSource.get(key);
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
