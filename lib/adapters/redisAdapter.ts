/**
 * redisAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import Redis = require("ioredis");
import {ConfigStore} from "../configStore";
import {IAdapter} from "./adapter";

export interface IRedisAdapterOption {
  key: string;
  cluster: boolean;
  configStore: ConfigStore;
}

export class RedisAdapter implements IAdapter {
  public readonly client: Redis.Redis|Redis.Cluster;

  constructor(option: IRedisAdapterOption) {
    const config = option.configStore.get(option.key);
    if (option.cluster) {
      this.client = new Redis.Cluster(config.members);
    } else {
      this.client = new Redis(config);
    }
  }

  public dispose() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
