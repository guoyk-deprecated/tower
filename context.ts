/**
 * context.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import path = require("path");
import scriptlet = require("scriptlet");
import {IAdapter} from "./adapters/adapter";
import {RedisAdapter} from "./adapters/redisAdapter";
import {SqlAdapter, SqlAdapterType} from "./adapters/sqlAdapter";
import {XlsAdapter} from "./adapters/xlsAdapter";
import {ConfigStore} from "./configStore";

export interface ITowerConfigOption {
  configStore: ConfigStore;
  scriptDir: string;
}

export class TowerContext implements IAdapter {
  /** internal config store */
  public readonly configStore: ConfigStore;
  /** tracked adapters */
  public readonly adapters: Set<IAdapter>;
  /** script directory */
  public readonly scriptDir: string;

  constructor(option: ITowerConfigOption) {
    this.configStore = option.configStore;
    this.scriptDir = option.scriptDir;
    this.adapters = new Set();
  }

  /**
   * dispose all tracked adapters
   */
  public dispose(): void {
    for (const adapter of this.adapters) {
      adapter.dispose();
    }
    this.adapters.clear();
  }

  public sqlAdapter(key: string): SqlAdapter {
    const adapter = new SqlAdapter(
        {key, type: SqlAdapterType.Single, configStore: this.configStore});
    this.track(adapter);
    return adapter;
  }

  public sqlReplicaAdapter(key: string): SqlAdapter {
    const adapter = new SqlAdapter(
        {key, type: SqlAdapterType.Replica, configStore: this.configStore});
    this.track(adapter);
    return adapter;
  }

  public sqlShardAdapter(key: string): SqlAdapter {
    const adapter = new SqlAdapter(
        {key, type: SqlAdapterType.Shard, configStore: this.configStore});
    this.track(adapter);
    return adapter;
  }

  public redisAdapter(key: string): RedisAdapter {
    const adapter =
        new RedisAdapter({cluster: false, key, configStore: this.configStore});
    this.track(adapter);
    return adapter;
  }

  public redisClusterAdapter(key: string): RedisAdapter {
    const adapter =
        new RedisAdapter({cluster: false, key, configStore: this.configStore});
    this.track(adapter);
    return adapter;
  }

  public xlsAdapter(key: string): XlsAdapter {
    const adapter = new XlsAdapter({key, configStore: this.configStore});
    this.track(adapter);
    return adapter;
  }

  private track(adapter: IAdapter): void {
    this.adapters.add(adapter);
  }
}
