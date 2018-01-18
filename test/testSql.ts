/**
 * testSql.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import path = require("path");
import {Tower} from "../";

describe("SqlAdapter", () => {
     it("should work", async () => {
         const tower = new Tower({
             configDir: path.join(__dirname, "testConfig"),
             scriptDir: path.join(__dirname, "testScript"),
         });
         await tower.load();
         const context = tower.createContext();
         const sqlAdapter = context.createShardSqlAdapter("test-split");
         await sqlAdapter.query("SELECT COUNT(*) FROM test;", null, {
             shardOf: 100001,
         });
         context.dispose();
     });
 });
