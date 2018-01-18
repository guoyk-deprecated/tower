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
const Koa = require("koa");
const KoaBody = require("koa-body");
const configStore_1 = require("./lib/configStore");
const context_1 = require("./lib/context");
const scriptStore_1 = require("./lib/scriptStore");
const utils_1 = require("./utils");
/**
 * main class of Tower
 */
class Tower {
    constructor(config) {
        this.configStore = new configStore_1.ConfigStore(config.configDir);
        this.scriptStore = new scriptStore_1.ScriptStore(config.scriptDir);
        this.port = config.port || 3000;
    }
    /**
     * load all internal components
     */
    async load() {
        await this.configStore.reload();
    }
    /**
     * start the web server
     */
    async startWeb() {
        const app = new Koa();
        app.use(KoaBody());
        app.use(async (ctx) => {
            const tctx = this.createContext();
            const path = utils_1.sanitizePath(ctx.path);
            const request = {};
            Object.assign(request, ctx.request.query);
            Object.assign(request, ctx.request.body);
            ctx.response.body = await tctx.runScript(utils_1.sanitizePath(ctx.path), request);
        });
        return new Promise((resolve, reject) => {
            app.listen(this.port, () => {
                resolve();
            });
        });
    }
    /**
     * create a new context
     */
    createContext() {
        return new context_1.Context({
            configSource: this.configStore,
            scriptSource: this.scriptStore,
        });
    }
}
exports.Tower = Tower;
