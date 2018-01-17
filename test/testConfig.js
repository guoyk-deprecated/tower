"use strict";
/**
 * testConfig.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const configStore_1 = require("../lib/configStore");
describe("tower.ScriptStore", () => {
    it("should work with directory", async () => {
        const store = new configStore_1.ConfigStore(path.join(__dirname, "testConfig"));
        await store.reload();
        let value = await store.get("key1");
        assert.equal(value, "value1");
        value = await store.get("key2");
        assert.equal(value.key, "value");
        const val1 = await store.get("key1");
        assert.equal(val1, "value1");
        const val2 = await store.get("key2");
        assert.equal(val2.key, "value");
        const val3 = await store.get("key3");
        assert.equal(val3, "value1");
        const val4 = await store.get("key4");
        assert.equal(val4.key, "value");
        const val5 = await store.get("key5");
        assert.equal(val5, "value1");
        const val6 = await store.get("key6");
        assert.equal(val6.key, "value");
    });
});
