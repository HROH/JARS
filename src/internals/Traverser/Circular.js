JARS.internal('Traverser/Circular', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    var Circular = {
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         *
         * @return {boolean}
         */
        onEnter: function(subject, entryModule, depth) {
            return !equalsEntryModule(subject, entryModule, depth) && !(subject.state.isLoading() || subject.state.isLoaded());
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         * @param {*} circularList
         *
         * @return {JARS~internals.Traverser.Modules~Result}
         */
        onLeave: function(subject, entryModule, depth, circularList) {
            (circularList || (equalsEntryModule(subject, entryModule, depth) && (circularList = []))) && circularList.unshift(subject.name);

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
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {number} depth
     *
     * @return {boolean}
     */
    function equalsEntryModule(subject, entryModule, depth) {
        return depth && subject === entryModule;
    }

    return Circular;
});
