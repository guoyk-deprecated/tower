"use strict";
/**
 * testScript.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const _1 = require("../");
const NS_PER_SEC = 1e9;
describe("ScriptStore", () => {
    it("should works", async () => {
        const tower = new _1.Tower({
            configDir: path.join(__dirname, "testConfig"),
            scriptDir: path.join(__dirname, "testScript"),
        });
        await tower.load();
        const context = tower.createContext();
        const start1 = process.hrtime();
        const resp = await context.runScript("hello", { value: 5 });
        const ts1 = process.hrtime(start1);
        const start2 = process.hrtime();
        const resp2 = await context.runScript("hello", { value: 5 });
        const ts2 = process.hrtime(start2);
        assert.equal(resp.value, 6);
        assert.equal(resp2.value, 6);
    });
});
