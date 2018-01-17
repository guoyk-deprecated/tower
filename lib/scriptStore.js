"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * scriptStore.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
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
        let content = await fs.readFile(fullPath, "utf8");
        content = "(async function(require, $request, $response){\n" +
            content + "\n})";
        const script = new vm.Script(content, {
            filename: name,
            lineOffset: -1,
            produceCachedData: true,
        });
        this.cache.set(fullPath, { fullPath, mtime: stat.mtimeMs, script });
        return script;
    }
    /**
     * execute a script with given request
     * @param name script name
     * @param request request object
     * @returns {Promise<any>} response produced
     */
    async runScript(name, request) {
        const script = (await this.getScript(name));
        const resp = {};
        const func = script.runInThisContext();
        await func(require, request, resp);
        return resp;
    }
}
exports.ScriptStore = ScriptStore;
