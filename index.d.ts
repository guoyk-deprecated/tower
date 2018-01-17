/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { ConfigStore } from "./lib/configStore";
import { ScriptStore } from "./lib/scriptStore";
export interface ITowerConfig {
    /** configuration directory */
    configDir: string;
    /** script directory */
    scriptDir: string;
    /** port number for web service */
    port?: number;
}
export declare class Tower {
    readonly configStore: ConfigStore;
    readonly scriptStore: ScriptStore;
    constructor(config: ITowerConfig);
    /**
     * load all internal components
     */
    load(): Promise<void>;
}
