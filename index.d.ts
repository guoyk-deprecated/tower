/**
 * index.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import cron = require("cron");
import Koa = require("koa");
import { ConfigStore } from "./configStore";
import { TowerContext } from "./context";
export interface ITowerOption {
    /** configuration directory */
    configDir: string;
    /** script directory */
    scriptDir: string;
}
/**
 * main class of Tower
 */
export declare class Tower {
    readonly configStore: ConfigStore;
    readonly cronJobs: Set<cron.CronJob>;
    readonly scriptDir: string;
    readonly webApp: Koa;
    constructor(config: ITowerOption);
    /**
     * load all internal components
     */
    load(): Promise<void>;
    /**
     * start the web server
     * @param port port to listen
     */
    startWeb(port: number): Promise<{}>;
    /**
     * register a cron job
     * @param schedule schedule cron syntax
     * @param scriptName script name to run
     */
    registerCron(schedule: string, scriptName: string): void;
    /**
     * run function with new context and dispose that context
     * @param func function
     */
    withContext(func: (context: TowerContext) => Promise<void>): Promise<void>;
    /**
     * create a TowerContext
     */
    createContext(): TowerContext;
    /**
     * create Koa web handler
     */
    private createWebHandler();
}
