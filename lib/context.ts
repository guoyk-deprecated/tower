/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import {SqlAdapter, SqlAdapterType} from "./adapters/sqlAdapter";
import {IAdapter, IConfigSource} from "./interface";

/**
 * context is used to track creation and disposing of adapters
 */
export class Context {
  /** config store */
  public readonly configSource: IConfigSource;

  /** all living adapters */
  public readonly adapters: Set<IAdapter>;

  /**
   * initialize a context
   * @param configStore config store
   */
  constructor(configStore: IConfigSource) {
    this.configSource = configStore;
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
