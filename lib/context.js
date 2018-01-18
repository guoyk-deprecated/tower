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
/**
 * context is used to track creation and disposing of adapters
 */
class Context {
    /**
     * initialize a context
     * @param configStore config store
     */
    constructor(configStore) {
        this.configSource = configStore;
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
