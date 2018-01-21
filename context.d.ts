/**
 * context.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import { IAdapter } from "./adapters/adapter";
import { RedisAdapter } from "./adapters/redisAdapter";
import { SqlAdapter } from "./adapters/sqlAdapter";
import { XlsAdapter } from "./adapters/xlsAdapter";
import { ConfigStore } from "./configStore";
export declare class TowerContext implements IAdapter {
    /** internal config store */
    readonly configStore: ConfigStore;
    /** tracked adapters */
    readonly adapters: Set<IAdapter>;
    constructor(configStore: ConfigStore);
    /**
     * dispose all tracked adapters
     */
    dispose(): void;
    sqlAdapter(key: string): SqlAdapter;
    sqlReplicaAdapter(key: string): SqlAdapter;
    sqlShardAdapter(key: string): SqlAdapter;
    redisAdapter(key: string): RedisAdapter;
    redisClusterAdapter(key: string): RedisAdapter;
    XlsAdapter(key: string): XlsAdapter;
    private track(adapter);
}
