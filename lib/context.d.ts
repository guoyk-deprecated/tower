import { SqlAdapter } from "./adapters/sqlAdapter";
import { XlsAdapter } from "./adapters/xlsAdapter";
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
    createReplicaSqlAdapter(key: string): SqlAdapter;
    /**
     * create a shard sql adapter
     * @param key config key
     */
    createShardSqlAdapter(key: string): SqlAdapter;
    createXlsAdapter(key: string): XlsAdapter;
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
    $replicaSqlAdapter(key: string): SqlAdapter;
    /** alias to createShardSqlAdapter */
    $shardSqlAdapter(key: string): SqlAdapter;
    /** alias to createXlsAdapter */
    $xlsAdapter(key: string): XlsAdapter;
    $reloadConfig(): Promise<void>;
    /**
     * track a adapter
     * @param adapter adapter to track
     * @returns the adapter
     */
    private track(adapter);
}
