import { IAdapter } from "./adapters/adapter";
import { RedisAdapter } from "./adapters/redisAdapter";
import { SqlAdapter } from "./adapters/sqlAdapter";
import { XlsAdapter } from "./adapters/xlsAdapter";
import { ConfigStore } from "./configStore";
import { ScriptStore } from "./scriptStore";
export interface IContextOption {
    configStore: ConfigStore;
    scriptStore: ScriptStore;
}
/**
 * context is used to track creation and disposing of adapters
 */
export declare class Context {
    /** config source */
    readonly configStore: ConfigStore;
    /** script source */
    readonly scriptStore: ScriptStore;
    /** all living adapters */
    readonly adapters: Set<IAdapter>;
    /** defined functions */
    private cache;
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
    createSqlReplicaAdapter(key: string): SqlAdapter;
    /**
     * create a shard sql adapter
     * @param key config key
     */
    createSqlShardAdapter(key: string): SqlAdapter;
    createXlsAdapter(key: string): XlsAdapter;
    createRedisAdapter(key: string): RedisAdapter;
    createRedisClusterAdapter(key: string): RedisAdapter;
    /**
     * execute a script with given request
     * @param name script name
     * @param request request object
     * @returns {Promise<any>} response produced
     */
    runScript(name: string, input?: any): Promise<any>;
    /**
     * alias to runScript
     */
    $load(name: string, input?: any): Promise<any>;
    /** alias to createSqlAdapter */
    $sqlAdapter(key: string): SqlAdapter;
    /** alias to createReplicaAdapter */
    $sqlReplicaAdapter(key: string): SqlAdapter;
    /** alias to createSqlShardAdapter */
    $sqlShardAdapter(key: string): SqlAdapter;
    /** alias to createXlsAdapter */
    $xlsAdapter(key: string): XlsAdapter;
    $redisAdapter(key: string): RedisAdapter;
    $redisClusterAdapter(key: string): RedisAdapter;
    $reloadConfig(): Promise<void>;
    /**
     * track a adapter
     * @param adapter adapter to track
     * @returns the adapter
     */
    private track(adapter);
}
