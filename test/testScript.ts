/**
 * testScript.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import assert = require("assert");
import path = require("path");
import {ScriptStore} from "../lib/scriptStore";

const NS_PER_SEC = 1e9;

describe("ScriptStore", () => {
  it("should works", async () => {
    const store = new ScriptStore(path.join(__dirname, "testScript"));
    const start1 = process.hrtime();
    const resp = await store.runScript("hello", { value: 5 });
    const ts1 = process.hrtime(start1);
    const start2 = process.hrtime();
    const resp2 = await store.runScript("hello", { value: 5 });
    const ts2 = process.hrtime(start2);
    assert.equal(resp.value, 6);
    assert.equal(resp2.value, 6);
  });
});