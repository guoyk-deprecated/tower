"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * context is used to track creation and disposing of adapters
 */
class Context {
    /**
     * initialize a context
     * @param configStore config store
     */
    constructor(configStore) {
        this.configStore = configStore;
        this.adapters = new Set();
    }
    /**
     * track a adapter
     * @param adapter adapter to track
     */
    track(adapter) {
        this.adapters.add(adapter);
    }
    /**
     * dispose all previously tracked adapters
     */
    dispose() {
        for (const adapter of this.adapters) {
            adapter.dispose();
        }
        this.adapters.clear();
    }
}
exports.Context = Context;
