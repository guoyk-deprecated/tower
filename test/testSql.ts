/**
 * testSql.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import assert = require("assert");
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
         const ret = await sqlAdapter.query("SELECT * FROM test;", null, {
             shardOf: "all",
         });
         context.dispose();
         assert.equal(ret.rows.length, 2);
         assert.equal(ret.rows[0].id, 1);
         assert.equal(ret.rows[0].value, "a");
         assert.equal(ret.rows[1].id, 1);
         assert.equal(ret.rows[1].value, "a");
     });
 });
