"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
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
        this.cronJobs = new Set();
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
            try {
                ctx.response.body =
                    await tctx.runScript(utils_1.sanitizePath(ctx.path), request);
            }
            catch (e) {
                ctx.response.body = {
                    detail: e.stack,
                    errCode: 9999,
                    message: e.message,
                };
            }
            tctx.dispose();
        });
        return new Promise((resolve, reject) => {
            app.listen(this.port, () => {
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
            const context = this.createContext();
            context.runScript(scriptName);
        }));
    }
    /**
     * create a new context
     */
    createContext() {
        return new context_1.Context({
            configStore: this.configStore,
            scriptStore: this.scriptStore,
        });
    }
}
exports.Tower = Tower;
