/**
 * utils.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * sanitize a POSIX path string, removing any absolute / parent traversing
 * components
 */
export function sanitizePath(p: string): string {
  return sanitizePathComponents(p).join("/");
}

/**
 * sanitize a POSIX path string, removing any absolute / parent traversing
 * components
 */
export function sanitizePathComponents(p: string): string[] {
  return p.split("/").filter((c) => c !== "." && c !== ".." && c.length !== 0);
}
