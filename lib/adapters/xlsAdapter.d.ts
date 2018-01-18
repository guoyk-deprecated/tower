import { ConfigStore } from "../configStore";
import { IAdapter } from "./adapter";
export declare const DEFAULT_SHEET_NAME = "main";
export interface IXlsAdapterOption {
    key: string;
    configSource: ConfigStore;
}
export declare class XlsAdapter implements IAdapter {
    readonly key: string;
    readonly configSource: ConfigStore;
    constructor(option: IXlsAdapterOption);
    /**
     * write a xls file to directory
     * @param theme sub-directory
     * @param name name of file, .xls extension is appended automatically
     * @param data data to write
     */
    write(theme: string, name: string, data: any[][]): Promise<any>;
    dispose(): void;
}
