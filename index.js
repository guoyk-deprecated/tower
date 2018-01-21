"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const Koa = require("koa");
const KoaBody = require("koa-body");
const path = require("path");
const scriptlet = require("scriptlet");
const configStore_1 = require("./configStore");
const context_1 = require("./context");
const utils_1 = require("./utils");
/**
 * main class of Tower
 */
class Tower {
    constructor(config) {
        this.scriptDir = config.scriptDir;
        this.configStore = new configStore_1.ConfigStore(config.configDir);
        this.cronJobs = new Set();
        this.webApp = new Koa();
        this.webApp.use(KoaBody());
        this.webApp.use(this.createWebHandler());
    }
    /**
     * load all internal components
     */
    async load() {
        await this.configStore.load();
    }
    /**
     * start the web server
     * @param port port to listen
     */
    async startWeb(port) {
        return new Promise((resolve, reject) => {
            this.webApp.listen(port, () => {
                resolve();
            });
        });
    }
    /**
     * register a cron job
     * @param schedule schedule cron syntax
     * @param scriptName script name to run
     */
    registerCron(schedule, scriptName) {
        this.cronJobs.add(new cron_1.CronJob(schedule, () => {
            this.withContext(async (context) => {
                const fullPath = path.join(this.scriptDir, utils_1.sanitizePath(scriptName) + ".js");
                await scriptlet.run(fullPath, {
                    cache: scriptlet.MTIME,
                    extra: new Map([["$tower", context]]),
                });
            });
        }));
    }
    /**
     * run function with new context and dispose that context
     * @param func function
     */
    async withContext(func) {
        const context = this.createContext();
        await func(context);
        context.dispose();
    }
    /**
     * create a TowerContext
     */
    createContext() {
        return new context_1.TowerContext(this.configStore);
    }
    /**
     * create Koa web handler
     */
    createWebHandler() {
        return async (ctx) => {
            const fullPath = path.join(this.scriptDir, utils_1.sanitizePath(ctx.path) + ".js");
            const input = {};
            Object.assign(input, ctx.request.query);
            Object.assign(input, ctx.request.body);
            await this.withContext(async (context) => {
                try {
                    ctx.response.body = await scriptlet.run(fullPath, {
                        cache: scriptlet.MTIME,
                        extra: new Map([["$tower", context], ["$input", input]]),
                    });
                }
                catch (e) {
                    ctx.response
                        .body = { errCode: 9999, message: e.message, detail: e.stack };
                }
            });
        };
    }
}
exports.Tower = Tower;
