export declare class ConfigStore {
    /**
     * config directory
     */
    readonly directory: string;
    /**
     * loaded config entries
     */
    private store;
    /**
     * @param dir config directory
     */
    constructor(dir: string);
    /**
     * load all config entries from directory
     */
    reload(): Promise<void>;
    /**
     * get config value by key
     * @param key config key
     */
    get(key: string): any;
    private loadJSON(fullPath);
    private loadYAML(fullPath);
    private loadObject(ret, fullPath);
}
