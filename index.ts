/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import cron = require("cron");
import {CronJob} from "cron";
import Koa = require("koa");
import {Context} from "koa";
import KoaBody = require("koa-body");
import {ConfigStore} from "./configStore";
import {TowerContext} from "./context";
import {sanitizePath} from "./utils";

export interface ITowerOption {
  /** configuration directory */
  configDir: string;
  /** script directory */
  scriptDir: string;
}

/**
 * main class of Tower
 */
export class Tower {
  public readonly configStore: ConfigStore;
  public readonly cronJobs: Set<cron.CronJob>;
  public readonly scriptDir: string;
  public readonly webApp: Koa;

  public constructor(config: ITowerOption) {
    this.scriptDir = config.scriptDir;
    this.configStore = new ConfigStore(config.configDir);
    this.cronJobs = new Set();
    this.webApp = new Koa();
    this.webApp.use(KoaBody());
    this.webApp.use(this.createWebHandler());
  }

  /**
   * load all internal components
   */
  public async load(): Promise<void> {
    await this.configStore.load();
  }

  /**
   * start the web server
   * @param port port to listen
   */
  public async startWeb(port: number) {
    return new Promise((resolve, reject) => {
      this.webApp.listen(port, () => {
        resolve();
      });
    });
  }

  /**
   * register a cron job
   * @param schedule schedule cron syntax
   * @param name script name to run
   */
  public registerCron(schedule: string, name: string) {
    this.cronJobs.add(new CronJob(schedule, () => {
      this.withContext(async (context: TowerContext) => {
        await context.load(name);
      });
    }));
  }

  /**
   * run function with new context and dispose that context
   * @param func function
   */
  public async withContext(func: (context: TowerContext) => Promise<void>) {
    const context = this.createContext();
    await func(context);
    context.dispose();
  }

  /**
   * create a TowerContext
   */
  public createContext(): TowerContext {
    return new TowerContext({
      configStore: this.configStore,
      scriptDir: this.scriptDir,
    });
  }

  /**
   * create Koa web handler
   */
  private createWebHandler(): any {
    return async (ctx: Koa.Context) => {
      const input = {};
      Object.assign(input, ctx.request.query);
      Object.assign(input, ctx.request.body);
      await this.withContext(async (context: TowerContext) => {
        try {
          ctx.response.body = await context.load(sanitizePath(ctx.path), input);
        } catch (e) {
          ctx.response
              .body = {errCode: 9999, message: e.message, detail: e.stack};
        }
      });
    };
  }
}
