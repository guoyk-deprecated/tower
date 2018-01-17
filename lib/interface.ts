/**
 * interface.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export interface IConfigSource {
    get(key: string): any;
}

export interface IScriptSource {
    runScript(name: string, request: any): Promise<any>;
}
