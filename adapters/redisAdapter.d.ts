/// <reference types="ioredis" />
/**
 * redisAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import Redis = require("ioredis");
import { ConfigStore } from "../configStore";
import { IAdapter } from "./adapter";
export interface IRedisAdapterOption {
    key: string;
    cluster: boolean;
    configStore: ConfigStore;
}
export declare class RedisAdapter implements IAdapter {
    readonly client: Redis.Redis | Redis.Cluster;
    constructor(option: IRedisAdapterOption);
    dispose(): void;
}
