/**
 * configStore.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs = require("fs-extra");
import yaml = require("js-yaml");
import path = require("path");

export class ConfigStore {
    /**
     * config directory
     */
    public readonly directory: string;

    /**
     * loaded config entries
     */
    private store: Map<string, any>;

    /**
     * @param dir config directory
     */
    constructor(dir: string) {
        this.directory = dir;
        this.store = new Map();
    }

    /**
     * load all config entries from directory
     */
    public async reload(): Promise<void> {
        const files = await fs.readdir(this.directory);
        for (const file of files) {
            if (file.toLowerCase().endsWith(".json")) {
                await this.loadJSON(path.join(this.directory, file));
            }
            if (file.toLowerCase().endsWith(".yaml") || file.toLowerCase().endsWith(".yml")) {
                await this.loadYAML(path.join(this.directory, file));
            }
        }
    }

    /**
     * get config value by key
     * @param key config key
     */
    public get(key: string): any {
        return this.store.get(key);
    }

    private async loadJSON(fullPath: string): Promise<any> {
        const content = await fs.readFile(fullPath, "utf8");
        this.loadObject(JSON.parse(content), fullPath);
    }

    private async loadYAML(fullPath: string): Promise<any> {
        const content = await fs.readFile(fullPath, "utf8");
        this.loadObject(yaml.safeLoad(content), fullPath);
    }

    private loadObject(ret: any, fullPath: string) {
        if (typeof ret !== "object" || !Array.isArray(ret.configs)) {
            throw new Error(`invalid config file ${fullPath}`);
        }
        for (const entry of ret.configs) {
            if (typeof entry !== "object") {
                throw new Error(`config file ${fullPath} contains invalid entry`);
            }
            if (typeof entry.key !== "string") {
                throw new Error(`config file ${fullPath} contains entry without a valid string`);
            }
            this.store.set(entry.key, entry.value);
        }
    }
}
