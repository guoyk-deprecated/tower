/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import {IAdapter, IConfigSource} from "./interface";

/**
 * context is used to track creation and disposing of adapters
 */
export class Context {
  /** config store */
  public readonly configStore: IConfigSource;

  /** all living adapters */
  public readonly adapters: Set<IAdapter>;

  /**
   * initialize a context
   * @param configStore config store
   */
  constructor(configStore: IConfigSource) {
    this.configStore = configStore;
    this.adapters = new Set();
  }

  /**
   * track a adapter
   * @param adapter adapter to track
   */
  public track(adapter: IAdapter) {
    this.adapters.add(adapter);
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
}
