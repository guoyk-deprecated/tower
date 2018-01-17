"use strict";
/**
 * sqlAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SqlAdapter {
    async query(sql, args, option) {
        return {
            rows: [],
        };
    }
    dispose() {
    }
}
exports.SqlAdapter = SqlAdapter;
