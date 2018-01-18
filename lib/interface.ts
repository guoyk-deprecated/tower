/**
 * interface.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import vm = require("vm");

/**
 * interface for ConfigStore
 */
export interface IConfigSource {
  /** get a config for key */
  get(key: string): any;
  /** reload the config store */
  reload(): Promise<void>;
}

/**
 * interface for ScriptStore
 */
export interface IScriptSource {
  getScript(name: string): Promise<vm.Script>;
}

/**
 * interface for Adapter
 */
export interface IAdapter {
  /** dispose internal resources */
  dispose(): void;
}
