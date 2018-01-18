/**
 * xlsAdapter.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

  import fs = require("fs-extra");
  import path = require("path");
  import xlsx = require("xlsx");
  import {IAdapter, IConfigSource} from "../interface";

  export const DEFAULT_SHEET_NAME = "main";

  interface IXLSXInternal {
    writeFileAsync(
        file: string,
        wb: xlsx.WorkBook,
        cb: (err: Error) => void): void;
  }

  export interface IXlsAdapterOption {
     key: string;
     configSource: IConfigSource;
 }

  interface IXlsAdapterConfig {
     output: string;
 }

  export class XlsAdapter implements IAdapter {

    public readonly key: string;
    public readonly configSource: IConfigSource;

    constructor(option: IXlsAdapterOption) {
        this.key = option.key;
        this.configSource = option.configSource;
    }

    /**
     * write a xls file to directory
     * @param theme sub-directory
     * @param name name of file, .xls extension is appended automatically
     * @param data data to write
     */
    public async write(theme: string, name: string, data: any[][]): Promise<any> {
        if (!name.toLowerCase().endsWith(".xls")) {
            name += ".xls";
        }
        const config = this.configSource.get(this.key) as IXlsAdapterConfig;
        await fs.mkdirp(path.join(config.output, theme));
        const fullPath = path.join(config.output, theme, name);
        const wb = xlsx.utils.book_new();
        wb.SheetNames.push(DEFAULT_SHEET_NAME);
        wb.Sheets[DEFAULT_SHEET_NAME] = xlsx.utils.aoa_to_sheet(data);
        return new Promise((resolve, reject) => {
            const xlsxinternal = xlsx as any as IXLSXInternal;
            xlsxinternal.writeFileAsync(fullPath, wb, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public dispose() {
        // does nothing
    }

 }
