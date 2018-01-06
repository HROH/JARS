JARS.internal('Traverser/Circular', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    var Circular = {
        /**
         * @param {JARS~internals.Module} module
         * @param {JARS~internals.Module} entryModule
         * @param {number} depth
         *
         * @return {boolean}
         */
        onModuleEnter: function(module, entryModule, depth) {
            return !equalsEntryModule(module, entryModule, depth) && (module.state.isRegistered() || module.state.isIntercepted());
        },
        /**
         * @param {JARS~internals.Module} module
         * @param {JARS~internals.Module} entryModule
         * @param {number} depth
         * @param {*} circularList
         *
         * @return {JARS~internals.Traverser.Modules~Result}
         */
        onModuleLeave: function(module, entryModule, depth, circularList) {
            (circularList || (equalsEntryModule(module, entryModule, depth) && (circularList = []))) && circularList.push(module.name);

            return {
                value: circularList,

                done: !!circularList
            };
        }
    };

    /**
     * @memberof JARS~internals.Traverser.Circular
     * @inner
     *
     * @param {JARS~internals.Module} module
     * @param {JARS~internals.Module} entryModule
     * @param {number} depth
     *
     * @return {boolean}
     */
    function equalsEntryModule(module, entryModule, depth) {
        return depth && module === entryModule;
    }

    return Circular;
});
