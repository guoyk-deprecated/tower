/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { IAdapter } from "./adapters/adapter";
import { IConfigSource } from "./interface";
/**
 * context is used to track creation and disposing of adapters
 */
export declare class Context {
    /** config store */
    readonly configStore: IConfigSource;
    /** all living adapters */
    readonly adapters: Set<IAdapter>;
    /**
     * initialize a context
     * @param configStore config store
     */
    constructor(configStore: IConfigSource);
    /**
     * track a adapter
     * @param adapter adapter to track
     */
    track(adapter: IAdapter): void;
    /**
     * dispose all previously tracked adapters
     */
    dispose(): void;
}
