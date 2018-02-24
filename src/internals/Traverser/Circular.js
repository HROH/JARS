JARS.internal('Traverser/Circular', function() {
    'use strict';

    var CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = ' - found circular dependencies "${0}"',
        Circular;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    Circular = {
        /**
         * @param {JARS~internals.Subjects.Module} module
         * @param {JARS~internals.Subjects.Module} entryModule
         * @param {number} depth
         *
         * @return {boolean}
         */
        onModuleEnter: function(module, entryModule, depth) {
            return !equalsEntryModule(module, entryModule, depth) && (module.state.isRegistered() || module.state.isIntercepted());
        },
        /**
         * @param {JARS~internals.Subjects.Module} module
         * @param {JARS~internals.Subjects.Module} entryModule
         * @param {number} depth
         * @param {*} circularList
         *
         * @return {JARS~internals.Traverser.Modules~Result}
         */
        onModuleLeave: function(module, entryModule, depth, circularList) {
            (circularList || (equalsEntryModule(module, entryModule, depth) && (circularList = []))) && circularList.unshift(module.name);

            if(circularList && !depth) {
                entryModule.state.setAborted(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [circularList.join(CIRCULAR_SEPARATOR)]);
            }

            return {
                value: depth ? circularList : !!circularList,

                done: !!circularList
            };
        }
    };

    /**
     * @memberof JARS~internals.Traverser.Circular
     * @inner
     *
     * @param {JARS~internals.Subjects.Module} module
     * @param {JARS~internals.Subjects.Module} entryModule
     * @param {number} depth
     *
     * @return {boolean}
     */
    function equalsEntryModule(module, entryModule, depth) {
        return depth && module === entryModule;
    }

    return Circular;
});
