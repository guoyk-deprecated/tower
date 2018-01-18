/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import Koa = require("koa");
import KoaBody = require("koa-body");
import {ConfigStore} from "./lib/configStore";
import {Context} from "./lib/context";
import {ScriptStore} from "./lib/scriptStore";
import { sanitizePath } from "./utils";

export interface ITowerOption {
  /** configuration directory */
  configDir: string;
  /** script directory */
  scriptDir: string;
  /** port number for web service */
  port?: number;
}

/**
 * main class of Tower
 */
export class Tower {
  public readonly configStore: ConfigStore;
  public readonly scriptStore: ScriptStore;
  public readonly port: number;

  public constructor(config: ITowerOption) {
    this.configStore = new ConfigStore(config.configDir);
    this.scriptStore = new ScriptStore(config.scriptDir);
    this.port = config.port || 3000;
  }

  /**
   * load all internal components
   */
  public async load(): Promise<void> {
    await this.configStore.reload();
  }

  /**
   * start the web server
   */
  public async startWeb() {
    const app = new Koa();
    app.use(KoaBody());
    app.use(async (ctx) => {
      const tctx = this.createContext();
      const path = sanitizePath(ctx.path);
      const request = {};
      Object.assign(request, ctx.request.query);
      Object.assign(request, ctx.request.body);
      try {
        ctx.response.body =
            await tctx.runScript(sanitizePath(ctx.path), request);
      } catch (e) {
        ctx.response.body = {
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
   * create a new context
   */
  public createContext(): Context {
    return new Context({
      configSource: this.configStore,
      scriptSource: this.scriptStore,
    });
  }
}
