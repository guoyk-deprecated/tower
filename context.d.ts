import { IAdapter } from "./adapters/adapter";
import { RedisAdapter } from "./adapters/redisAdapter";
import { SqlAdapter } from "./adapters/sqlAdapter";
import { XlsAdapter } from "./adapters/xlsAdapter";
import { ConfigStore } from "./configStore";
export interface ITowerConfigOption {
    configStore: ConfigStore;
    scriptDir: string;
}
export declare class TowerContext implements IAdapter {
    /** internal config store */
    readonly configStore: ConfigStore;
    /** tracked adapters */
    readonly adapters: Set<IAdapter>;
    /** script directory */
    readonly scriptDir: string;
    constructor(option: ITowerConfigOption);
    /**
     * dispose all tracked adapters
     */
    dispose(): void;
    sqlAdapter(key: string): SqlAdapter;
    sqlReplicaAdapter(key: string): SqlAdapter;
    sqlShardAdapter(key: string): SqlAdapter;
    redisAdapter(key: string): RedisAdapter;
    redisClusterAdapter(key: string): RedisAdapter;
    xlsAdapter(key: string): XlsAdapter;
    private track(adapter);
}
