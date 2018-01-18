"use strict";
/**
 * scriptStore.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const vm = require("vm");
const utils_1 = require("../utils");
class ScriptStore {
    /**
     * @param dir source root directory
     */
    constructor(dir) {
        this.directory = dir;
        this.cache = new Map();
    }
    /**
     * get a compiled vm.Script instance from speicifed file, relative to
     * directory
     * @param name
     */
    async getScript(name) {
        if (!name.toLowerCase().endsWith(".js")) {
            name += ".js";
        }
        const fullPath = path.join(this.directory, ...utils_1.sanitizePathComponents(name));
        const stat = await fs.stat(fullPath);
        const cached = this.cache.get(fullPath);
        if (cached && cached.mtime === stat.mtimeMs) {
            return cached.script;
        }
        const content = await fs.readFile(fullPath, "utf8");
        const script = new vm.Script(content, {
            filename: name,
            lineOffset: -1,
            produceCachedData: true,
        });
        this.cache.set(fullPath, { fullPath, mtime: stat.mtimeMs, script });
        return script;
    }
}
exports.ScriptStore = ScriptStore;
