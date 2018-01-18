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
const path = require("path");
const _1 = require("../");
describe("XlsAdapter", () => {
    it("should work", async () => {
        const tower = new _1.Tower({
            configDir: path.join(__dirname, "testConfig"),
            scriptDir: path.join(__dirname, "testScript"),
        });
        await tower.load();
        const context = tower.createContext();
        const xlsAdapter = context.createXlsAdapter("xls");
        await xlsAdapter.write("testTheme", "test", [["A", "B", "C"], ["A1", "A2", "A3"]]);
        context.dispose();
    });
});
