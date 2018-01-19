"use strict";
/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const redisAdapter_1 = require("./adapters/redisAdapter");
const sqlAdapter_1 = require("./adapters/sqlAdapter");
const xlsAdapter_1 = require("./adapters/xlsAdapter");
/**
 * context is used to track creation and disposing of adapters
 */
class Context {
    /**
     * initialize a context
     * @param configStore config store
     */
    constructor(option) {
        this.configStore = option.configStore;
        this.scriptStore = option.scriptStore;
        this.adapters = new Set();
        this.cache = new Map();
    }
    /**
     * dispose all previously tracked adapters
     */
    dispose() {
        // clean all adapters
        for (const adapter of this.adapters) {
            adapter.dispose();
        }
        this.adapters.clear();
        // clean all cached functions
        this.cache.clear();
    }
    /**
     * create a single sql adapter
     * @param key config key
     */
    createSqlAdapter(key) {
        return this.track(new sqlAdapter_1.SqlAdapter({
            configStore: this.configStore,
            key,
            type: sqlAdapter_1.SqlAdapterType.Single,
        }));
    }
    /**
     * create a replica sql adapter
     * @param key config key
     */
    createSqlReplicaAdapter(key) {
        return this.track(new sqlAdapter_1.SqlAdapter({
            configStore: this.configStore,
            key,
            type: sqlAdapter_1.SqlAdapterType.Replica,
        }));
    }
    /**
     * create a shard sql adapter
     * @param key config key
     */
    createSqlShardAdapter(key) {
        return this.track(new sqlAdapter_1.SqlAdapter({
            configStore: this.configStore,
            key,
            type: sqlAdapter_1.SqlAdapterType.Shard,
        }));
    }
    createXlsAdapter(key) {
        return this.track(new xlsAdapter_1.XlsAdapter({
            configStore: this.configStore,
            key,
        }));
    }
    createRedisAdapter(key) {
        return this.track(new redisAdapter_1.RedisAdapter({
            cluster: false,
            configStore: this.configStore,
            key,
        }));
    }
    createRedisClusterAdapter(key) {
        return this.track(new redisAdapter_1.RedisAdapter({
            cluster: true,
            configStore: this.configStore,
            key,
        }));
    }
    /**
     * execute a script with given request
     * @param name script name
     * @param request request object
     * @returns {Promise<any>} response produced
     */
    async runScript(name, input) {
        let func = this.cache.get(name);
        if (func == null) {
            // load a vm.Script object from script file
            const script = await this.scriptStore.getScript(name);
            // run the script and cache the function
            func = script.runInThisContext();
        }
        const output = {};
        const result = func(this, input, output);
        if (result instanceof Promise) {
            await result;
        }
        return output;
    }
    /**
     * alias to runScript
     */
    async $load(name, input) {
        return this.runScript(name, input);
    }
    /** alias to createSqlAdapter */
    $sqlAdapter(key) {
        return this.createSqlAdapter(key);
    }
    /** alias to createReplicaAdapter */
    $sqlReplicaAdapter(key) {
        return this.createSqlReplicaAdapter(key);
    }
    /** alias to createSqlShardAdapter */
    $sqlShardAdapter(key) {
        return this.createSqlShardAdapter(key);
    }
    /** alias to createXlsAdapter */
    $xlsAdapter(key) {
        return this.createXlsAdapter(key);
    }
    $redisAdapter(key) {
        return this.createRedisAdapter(key);
    }
    $redisClusterAdapter(key) {
        return this.createRedisClusterAdapter(key);
    }
    async $reloadConfig() {
        await this.configStore.reload();
    }
    /**
     * track a adapter
     * @param adapter adapter to track
     * @returns the adapter
     */
    track(adapter) {
        this.adapters.add(adapter);
        return adapter;
    }
}
exports.Context = Context;
