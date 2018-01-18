"use strict";
/**
 * xlsAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const xlsx = require("xlsx");
exports.DEFAULT_SHEET_NAME = "main";
class XlsAdapter {
    constructor(option) {
        this.key = option.key;
        this.configSource = option.configSource;
    }
    /**
     * write a xls file to directory
     * @param theme sub-directory
     * @param name name of file, .xls extension is appended automatically
     * @param data data to write
     */
    async write(theme, name, data) {
        if (!name.toLowerCase().endsWith(".xls")) {
            name += ".xls";
        }
        const config = this.configSource.get(this.key);
        await fs.mkdirp(path.join(config.output, theme));
        const fullPath = path.join(config.output, theme, name);
        const wb = xlsx.utils.book_new();
        wb.SheetNames.push(exports.DEFAULT_SHEET_NAME);
        wb.Sheets[exports.DEFAULT_SHEET_NAME] = xlsx.utils.aoa_to_sheet(data);
        return new Promise((resolve, reject) => {
            const xlsxinternal = xlsx;
            xlsxinternal.writeFileAsync(fullPath, wb, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    dispose() {
        // does nothing
    }
}
exports.XlsAdapter = XlsAdapter;
