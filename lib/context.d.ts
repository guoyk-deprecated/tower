/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { SqlAdapter } from "./adapters/sqlAdapter";
import { IAdapter, IConfigSource, IScriptSource } from "./interface";
export interface IContextOption {
    configSource: IConfigSource;
    scriptSource: IScriptSource;
}
/**
 * context is used to track creation and disposing of adapters
 */
export declare class Context {
    /** config source */
    readonly configSource: IConfigSource;
    /** script source */
    readonly scriptSource: IScriptSource;
    /** all living adapters */
    readonly adapters: Set<IAdapter>;
    /**
     * initialize a context
     * @param configStore config store
     */
    constructor(option: IContextOption);
    /**
     * dispose all previously tracked adapters
     */
    dispose(): void;
    /**
     * create a single sql adapter
     * @param key config key
     */
    createSqlAdapter(key: string): SqlAdapter;
    /**
     * create a replica sql adapter
     * @param key config key
     */
    createReplicaSqlAdapter(key: string): SqlAdapter;
    /**
     * create a shard sql adapter
     * @param key config key
     */
    createShardSqlAdapter(key: string): SqlAdapter;
    /**
     * execute a script with given request
     * @param name script name
     * @param request request object
     * @returns {Promise<any>} response produced
     */
    runScript(name: string, request: any): Promise<any>;
    /**
     * track a adapter
     * @param adapter adapter to track
     * @returns the adapter
     */
    private track(adapter);
}
