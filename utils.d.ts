/**
 * utils.ts
 *
 * Copyright (c) 2018 Yanke Guo <guoyk.cn@gmail.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
/**
 * sanitize a POSIX path string, removing any absolute / parent traversing components
 */
export declare function sanitizePath(p: string): string;
/**
 * sanitize a POSIX path string, removing any absolute / parent traversing components
 */
export declare function sanitizePathComponents(p: string): string[];
