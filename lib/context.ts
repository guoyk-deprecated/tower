/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import vm = require("vm");
import * as utils from "../utils";
import {IAdapter} from "./adapters/adapter";
import { RedisAdapter } from "./adapters/redisAdapter";
import {SqlAdapter, SqlAdapterType} from "./adapters/sqlAdapter";
import {XlsAdapter} from "./adapters/xlsAdapter";
import {ConfigStore} from "./configStore";
import {ScriptStore} from "./scriptStore";

export interface IContextOption {
  configStore: ConfigStore;
  scriptStore: ScriptStore;
}

/**
 * context is used to track creation and disposing of adapters
 */
export class Context {
  /** config source */
  public readonly configStore: ConfigStore;
  /** script source */
  public readonly scriptStore: ScriptStore;
  /** all living adapters */
  public readonly adapters: Set<IAdapter>;
  /** defined functions */
  private cache: Map<string, any>;

  /**
   * initialize a context
   * @param configStore config store
   */
  constructor(option: IContextOption) {
    this.configStore = option.configStore;
    this.scriptStore = option.scriptStore;
    this.adapters = new Set();
    this.cache = new Map();
  }

  /**
   * dispose all previously tracked adapters
   */
  public dispose() {
    // clean all adapters
    for (const adapter of this.adapters) {
      adapter.dispose();
    }
    this.adapters.clear();
    // clean all cached functions
    this.cache.clear();
  }

  /**
   * create a single sql adapter
   * @param key config key
   */
  public createSqlAdapter(key: string): SqlAdapter {
    return this.track(new SqlAdapter({
      configStore: this.configStore,
      key,
      type: SqlAdapterType.Single,
    })) as SqlAdapter;
  }

  /**
   * create a replica sql adapter
   * @param key config key
   */
  public createSqlReplicaAdapter(key: string): SqlAdapter {
    return this.track(new SqlAdapter({
      configStore: this.configStore,
      key,
      type: SqlAdapterType.Replica,
    })) as SqlAdapter;
  }

  /**
   * create a shard sql adapter
   * @param key config key
   */
  public createSqlShardAdapter(key: string): SqlAdapter {
    return this.track(new SqlAdapter({
      configStore: this.configStore,
      key,
      type: SqlAdapterType.Shard,
    })) as SqlAdapter;
  }

  public createXlsAdapter(key: string): XlsAdapter {
    return this.track(new XlsAdapter({
      configStore: this.configStore,
      key,
    })) as XlsAdapter;
  }

  public createRedisAdapter(key: string): RedisAdapter {
    return this.track(new RedisAdapter({
      cluster: false,
      configStore: this.configStore,
      key,
    })) as RedisAdapter;
  }

  public createRedisClusterAdapter(key: string): RedisAdapter {
    return this.track(new RedisAdapter({
      cluster: true,
      configStore: this.configStore,
      key,
    })) as RedisAdapter;
  }

  /**
   * execute a script with given request
   * @param name script name
   * @param request request object
   * @returns {Promise<any>} response produced
   */
  public async runScript(name: string, input?: any): Promise<any> {
    let func = this.cache.get(name);
    if (func == null) {
      // load a vm.Script object from script file
      const script = await this.scriptStore.getScript(name);
      // run the script and cache the function
      func = script.runInThisContext();
    }
    const output = {};
    const result = func(this, input, output);
    if (result instanceof Promise) {
      await result;
    }
    return output;
  }

  /**
   * alias to runScript
   */
  public async $load(name: string, input?: any): Promise<any> {
    return this.runScript(name, input);
  }

  /** alias to createSqlAdapter */
  public $sqlAdapter(key: string): SqlAdapter {
    return this.createSqlAdapter(key);
  }

  /** alias to createReplicaAdapter */
  public $sqlReplicaAdapter(key: string): SqlAdapter {
    return this.createSqlReplicaAdapter(key);
  }

  /** alias to createSqlShardAdapter */
  public $sqlShardAdapter(key: string): SqlAdapter {
    return this.createSqlShardAdapter(key);
  }

  /** alias to createXlsAdapter */
  public $xlsAdapter(key: string): XlsAdapter {
    return this.createXlsAdapter(key);
  }

  public $redisAdapter(key: string): RedisAdapter {
    return this.createRedisAdapter(key);
  }

  public $redisClusterAdapter(key: string): RedisAdapter {
    return this.createRedisClusterAdapter(key);
  }

  public async $reloadConfig(): Promise<void> {
    await this.configStore.reload();
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
