/**
 * interface.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
/**
 * interface for ConfigStore
 */
export interface IConfigSource {
    get(key: string): any;
}
/**
 * interface for ScriptStore
 */
export interface IScriptSource {
    runScript(name: string, request: any): Promise<any>;
}
/**
 * interface for Adapter
 */
export interface IAdapter {
    /** dispose internal resources */
    dispose(): void;
}
