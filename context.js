"use strict";
/**
 * context.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const scriptlet = require("scriptlet");
const redisAdapter_1 = require("./adapters/redisAdapter");
const sqlAdapter_1 = require("./adapters/sqlAdapter");
const xlsAdapter_1 = require("./adapters/xlsAdapter");
class TowerContext {
    constructor(option) {
        this.configStore = option.configStore;
        this.scriptDir = option.scriptDir;
        this.adapters = new Set();
    }
    /**
     * load a scriptlet
     * @param name script name
     * @param input optional input
     */
    async load(name, input) {
        const fullPath = path.join(this.scriptDir, name + ".js");
        return scriptlet.run(fullPath, {
            cache: scriptlet.MTIME,
            extra: new Map([["$tower", this], ["$input", input]]),
        });
    }
    /**
     * dispose all tracked adapters
     */
    dispose() {
        for (const adapter of this.adapters) {
            adapter.dispose();
        }
        this.adapters.clear();
    }
    sqlAdapter(key) {
        const adapter = new sqlAdapter_1.SqlAdapter({ key, type: sqlAdapter_1.SqlAdapterType.Single, configStore: this.configStore });
        this.track(adapter);
        return adapter;
    }
    sqlReplicaAdapter(key) {
        const adapter = new sqlAdapter_1.SqlAdapter({ key, type: sqlAdapter_1.SqlAdapterType.Replica, configStore: this.configStore });
        this.track(adapter);
        return adapter;
    }
    sqlShardAdapter(key) {
        const adapter = new sqlAdapter_1.SqlAdapter({ key, type: sqlAdapter_1.SqlAdapterType.Shard, configStore: this.configStore });
        this.track(adapter);
        return adapter;
    }
    redisAdapter(key) {
        const adapter = new redisAdapter_1.RedisAdapter({ cluster: false, key, configStore: this.configStore });
        this.track(adapter);
        return adapter;
    }
    redisClusterAdapter(key) {
        const adapter = new redisAdapter_1.RedisAdapter({ cluster: false, key, configStore: this.configStore });
        this.track(adapter);
        return adapter;
    }
    XlsAdapter(key) {
        const adapter = new xlsAdapter_1.XlsAdapter({ key, configStore: this.configStore });
        this.track(adapter);
        return adapter;
    }
    track(adapter) {
        this.adapters.add(adapter);
    }
}
exports.TowerContext = TowerContext;
