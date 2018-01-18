"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
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
        this.configSource = option.configSource;
        this.scriptSource = option.scriptSource;
        this.adapters = new Set();
    }
    /**
     * dispose all previously tracked adapters
     */
    dispose() {
        for (const adapter of this.adapters) {
            adapter.dispose();
        }
        this.adapters.clear();
    }
    /**
     * create a single sql adapter
     * @param key config key
     */
    createSqlAdapter(key) {
        return this.track(new sqlAdapter_1.SqlAdapter({
            configSource: this.configSource,
            key,
            type: sqlAdapter_1.SqlAdapterType.Single,
        }));
    }
    /**
     * create a replica sql adapter
     * @param key config key
     */
    createReplicaSqlAdapter(key) {
        return this.track(new sqlAdapter_1.SqlAdapter({
            configSource: this.configSource,
            key,
            type: sqlAdapter_1.SqlAdapterType.Replica,
        }));
    }
    /**
     * create a shard sql adapter
     * @param key config key
     */
    createShardSqlAdapter(key) {
        return this.track(new sqlAdapter_1.SqlAdapter({
            configSource: this.configSource,
            key,
            type: sqlAdapter_1.SqlAdapterType.Shard,
        }));
    }
    createXlsAdapter(key) {
        return this.track(new xlsAdapter_1.XlsAdapter({
            configSource: this.configSource,
            key,
        }));
    }
    /**
     * execute a script with given request
     * @param name script name
     * @param request request object
     * @returns {Promise<any>} response produced
     */
    async runScript(name, request) {
        const script = (await this.scriptSource.getScript(name));
        const resp = {};
        const func = script.runInThisContext();
        await func(require, this, request, resp);
        return resp;
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
