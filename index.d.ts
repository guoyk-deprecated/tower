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
     * create a new context
     */
    createContext(): Context;
}
