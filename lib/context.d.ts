/**
 * context.js
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { SqlAdapter } from "./adapters/sqlAdapter";
import { IAdapter, IConfigSource } from "./interface";
/**
 * context is used to track creation and disposing of adapters
 */
export declare class Context {
    /** config store */
    readonly configSource: IConfigSource;
    /** all living adapters */
    readonly adapters: Set<IAdapter>;
    /**
     * initialize a context
     * @param configStore config store
     */
    constructor(configStore: IConfigSource);
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
     * track a adapter
     * @param adapter adapter to track
     * @returns the adapter
     */
    private track(adapter);
}
