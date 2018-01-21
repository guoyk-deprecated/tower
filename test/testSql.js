"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * testSql.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const assert = require("assert");
const path = require("path");
const _1 = require("../");
describe("SqlAdapter", () => {
    it("should work", async () => {
        const tower = new _1.Tower({
            configDir: path.join(__dirname, "testConfig"),
            scriptDir: path.join(__dirname, "testScript"),
        });
        await tower.load();
        const context = tower.createContext();
        const sqlAdapter = context.sqlShardAdapter("test-split");
        const ret = await sqlAdapter.query("SELECT * FROM test;", null, {
            shardOf: "all",
        });
        const set = new Set();
        set.add(1);
        const ret2 = await sqlAdapter.queryMap("SELECT id AS nid, value AS V FROM test WHERE id = ?", set, { idColumn: "nid", shardOf: "all" });
        context.dispose();
        assert.equal(ret2.get("1").V, "a");
        assert.equal(ret.rows.length, 2);
        assert.equal(ret.rows[0].id, 1);
        assert.equal(ret.rows[0].value, "a");
        assert.equal(ret.rows[1].id, 1);
        assert.equal(ret.rows[1].value, "a");
    });
});
