"use strict";
/**
 * utils.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * sanitize a POSIX path string, removing any absolute / parent traversing components
 */
function sanitizePath(p) {
    return sanitizePathComponents(p).join("/");
}
exports.sanitizePath = sanitizePath;
/**
 * sanitize a POSIX path string, removing any absolute / parent traversing components
 */
function sanitizePathComponents(p) {
    return p.split("/").filter((c) => c !== "." && c !== ".." && c.length !== 0);
}
exports.sanitizePathComponents = sanitizePathComponents;
