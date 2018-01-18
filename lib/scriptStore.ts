/**
 * scriptStore.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs = require("fs-extra");
import path = require("path");
import vm = require("vm");
import {sanitizePathComponents} from "../utils";
import {IScriptSource} from "./interface";

interface IScriptCache {
  /// full path of script file
  fullPath: string;
  /// mtime in ms of cached scriptfile
  mtime: number;
  /// cached script object
  script: vm.Script;
}

export class ScriptStore implements IScriptSource {
  public readonly directory: string;

  private cache: Map<string, IScriptCache>;

  /**
   * @param dir source root directory
   */
  constructor(dir: string) {
    this.directory = dir;
    this.cache = new Map();
  }

  /**
   * get a compiled vm.Script instance from speicifed file, relative to
   * directory
   * @param name
   */
  public async getScript(name: string): Promise<vm.Script> {
    if (!name.toLowerCase().endsWith(".js")) {
      name += ".js";
    }
    const fullPath = path.join(this.directory, ...sanitizePathComponents(name));
    const stat = await fs.stat(fullPath);
    const cached = this.cache.get(fullPath);
    if (cached && cached.mtime === stat.mtimeMs) {
      return cached.script;
    }
    let content = await fs.readFile(fullPath, "utf8");
    content = "(async function(require, $context, $request, $response, $utils){\n" +
        content + "\n})";
    const script = new vm.Script(content, {
      filename: name,
      lineOffset: -1,
      produceCachedData: true,
    });
    this.cache.set(fullPath, {fullPath, mtime: stat.mtimeMs, script});
    return script;
  }

}
