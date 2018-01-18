/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as utils from "../utils";
import {SqlAdapter, SqlAdapterType} from "./adapters/sqlAdapter";
import { XlsAdapter } from "./adapters/xlsAdapter";
import {IAdapter, IConfigSource, IScriptSource} from "./interface";

export interface IContextOption {
  configSource: IConfigSource;
  scriptSource: IScriptSource;
}

/**
 * context is used to track creation and disposing of adapters
 */
export class Context {
  /** config source */
  public readonly configSource: IConfigSource;
  /** script source */
  public readonly scriptSource: IScriptSource;
  /** all living adapters */
  public readonly adapters: Set<IAdapter>;

  /**
   * initialize a context
   * @param configStore config store
   */
  constructor(option: IContextOption) {
    this.configSource = option.configSource;
    this.scriptSource = option.scriptSource;
    this.adapters = new Set();
  }

  /**
   * dispose all previously tracked adapters
   */
  public dispose() {
    for (const adapter of this.adapters) {
      adapter.dispose();
    }
    this.adapters.clear();
  }

  /**
   * create a single sql adapter
   * @param key config key
   */
  public createSqlAdapter(key: string): SqlAdapter {
    return this.track(new SqlAdapter({
      configSource: this.configSource,
      key,
      type: SqlAdapterType.Single,
    })) as SqlAdapter;
  }

  /**
   * create a replica sql adapter
   * @param key config key
   */
  public createReplicaSqlAdapter(key: string): SqlAdapter {
    return this.track(new SqlAdapter({
      configSource: this.configSource,
      key,
      type: SqlAdapterType.Replica,
    })) as SqlAdapter;
  }

  /**
   * create a shard sql adapter
   * @param key config key
   */
  public createShardSqlAdapter(key: string): SqlAdapter {
    return this.track(new SqlAdapter({
      configSource: this.configSource,
      key,
      type: SqlAdapterType.Shard,
    })) as SqlAdapter;
  }

  public createXlsAdapter(key: string): XlsAdapter {
    return this.track(new XlsAdapter({
      configSource: this.configSource,
      key,
    })) as XlsAdapter;
  }

  /**
   * execute a script with given request
   * @param name script name
   * @param request request object
   * @returns {Promise<any>} response produced
   */
  public async runScript(name: string, request: any): Promise<any> {
    const script = (await this.scriptSource.getScript(name));
    const resp = {};
    const func = script.runInThisContext();
    await func(require, this, request, resp, utils);
    return resp;
  }

  /**
   * track a adapter
   * @param adapter adapter to track
   * @returns the adapter
   */
  private track(adapter: IAdapter): IAdapter {
    this.adapters.add(adapter);
    return adapter;
  }
}
