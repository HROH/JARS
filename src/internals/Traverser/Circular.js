JARS.internal('Traverser/Circular', function(getInternal) {
    'use strict';

    var Result = getInternal('Traverser/Result'),
        Circular;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    Circular = {
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         *
         * @return {boolean}
         */
        onEnter: function(subject, entryModule, depth) {
            return !(equalsEntryModule(subject, entryModule, depth) || subject.state.isLoading() || subject.state.isLoaded() || subject.state.isAborted());
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entryModule
         * @param {number} depth
         * @param {string[]} [circularList]
         *
         * @return {JARS~internals.Traverser.Result}
         */
        onLeave: function(subject, entryModule, depth, circularList) {
            if(circularList || equalsEntryModule(subject, entryModule, depth)) {
                circularList = circularList ? [subject.name].concat(circularList) : [subject.name];
            }

            return new Result(circularList, !!circularList);
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
