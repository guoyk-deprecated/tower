/// <reference types="node" />
import vm = require("vm");
export declare class ScriptStore {
    readonly directory: string;
    private cache;
    /**
     * @param dir source root directory
     */
    constructor(dir: string);
    /**
     * get a compiled vm.Script instance from speicifed file, relative to
     * directory
     * @param name
     */
    getScript(name: string): Promise<vm.Script>;
}
