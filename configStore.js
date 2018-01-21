"use strict";
/**
 * configStore.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const yaml = require("js-yaml");
const path = require("path");
class ConfigStore {
    /**
     * @param dir config directory
     */
    constructor(dir) {
        this.directory = dir;
        this.store = new Map();
    }
    /**
     * load all config entries from directory
     */
    async load() {
        const files = await fs.readdir(this.directory);
        for (const file of files) {
            if (file.toLowerCase().endsWith(".json")) {
                await this.loadJSON(path.join(this.directory, file));
            }
            if (file.toLowerCase().endsWith(".yaml") ||
                file.toLowerCase().endsWith(".yml")) {
                await this.loadYAML(path.join(this.directory, file));
            }
        }
    }
    /**
     * get config value by key
     * @param key config key
     */
    get(key) {
        return this.store.get(key);
    }
    async loadJSON(fullPath) {
        const content = await fs.readFile(fullPath, "utf8");
        this.loadObject(JSON.parse(content), fullPath);
    }
    async loadYAML(fullPath) {
        const content = await fs.readFile(fullPath, "utf8");
        this.loadObject(yaml.safeLoad(content), fullPath);
    }
    loadObject(ret, fullPath) {
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
exports.ConfigStore = ConfigStore;
