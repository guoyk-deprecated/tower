"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const configStore_1 = require("./lib/configStore");
const context_1 = require("./lib/context");
const scriptStore_1 = require("./lib/scriptStore");
class Tower {
    constructor(config) {
        this.configStore = new configStore_1.ConfigStore(config.configDir);
        this.scriptStore = new scriptStore_1.ScriptStore(config.scriptDir);
    }
    /**
     * load all internal components
     */
    async load() {
        await this.configStore.reload();
    }
    /**
     * create a new context
     */
    createContext() {
        return new context_1.Context(this.configStore);
    }
}
exports.Tower = Tower;
