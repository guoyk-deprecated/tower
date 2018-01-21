"use strict";
/**
 * redisAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
class RedisAdapter {
    constructor(option) {
        const config = option.configStore.get(option.key);
        if (option.cluster) {
            this.client = new Redis.Cluster(config.members);
        }
        else {
            this.client = new Redis(config);
        }
    }
    dispose() {
        if (this.client) {
            this.client.disconnect();
        }
    }
}
exports.RedisAdapter = RedisAdapter;
