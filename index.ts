/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import {ConfigStore} from "./lib/configStore";
import {ScriptStore} from "./lib/scriptStore";

export interface ITowerConfig {
    /** configuration directory */
    configDir: string;
    /** script directory */
    scriptDir: string;
    /** port number for web service */
    port?: number;
}

export class Tower {
    public readonly configStore: ConfigStore;
    public readonly scriptStore: ScriptStore;

    public constructor(config: ITowerConfig) {
        this.configStore = new ConfigStore(config.configDir);
        this.scriptStore = new ScriptStore(config.scriptDir);
    }

    /**
     * load all internal components
     */
    public async load(): Promise<void> {
        await this.configStore.reload();
    }
}
