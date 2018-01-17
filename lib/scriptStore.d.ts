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
     * get a compiled vm.Script instance from speicifed file, relative to directory
     * @param name
     */
    getScript(name: string): Promise<vm.Script>;
    /**
     * execute a script with given request
     * @param name script name
     * @param request request object
     * @returns {Promise<any>} response produced
     */
    runScript(name: string, request: any): Promise<any>;
}
