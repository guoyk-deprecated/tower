/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import cron = require("cron");
import { ConfigStore } from "./lib/configStore";
import { Context } from "./lib/context";
import { ScriptStore } from "./lib/scriptStore";
export interface ITowerOption {
    /** configuration directory */
    configDir: string;
    /** script directory */
    scriptDir: string;
    /** port number for web service */
    port?: number;
}
/**
 * main class of Tower
 */
export declare class Tower {
    readonly configStore: ConfigStore;
    readonly scriptStore: ScriptStore;
    readonly port: number;
    readonly cronJobs: Set<cron.CronJob>;
    constructor(config: ITowerOption);
    /**
     * load all internal components
     */
    load(): Promise<void>;
    /**
     * start the web server
     */
    startWeb(): Promise<{}>;
    /**
     * register a cron job
     * @param schedule schedule cron syntax
     * @param scriptName script name to run
     */
    registerCron(schedule: string, scriptName: string): void;
    /**
     * create a new context
     */
    createContext(): Context;
}
