JARS.internal('Traverser/Circular', function(getInternal) {
    'use strict';

    var Result = getInternal('Traverser/Result'),
        States = getInternal('State/States'),
        Circular;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Traverser
     */
    Circular = {
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entrySubject
         * @param {number} depth
         *
         * @return {boolean}
         */
        onEnter: function(subject, entrySubject, depth) {
            return (subject.state.is(States.REGISTERED) || subject.state.is(States.INTERCEPTED)) && !equalsEntrySubject(subject, entrySubject, depth);
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {JARS~internals.Subjects.Subject} entrySubject
         * @param {number} depth
         * @param {string[]} [circularList]
         *
         * @return {JARS~internals.Traverser.Result}
         */
        onLeave: function(subject, entrySubject, depth, circularList) {
            if(circularList || equalsEntrySubject(subject, entrySubject, depth)) {
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
     * @param {JARS~internals.Subjects.Subject} entrySubject
     * @param {number} depth
     *
     * @return {boolean}
     */
    function equalsEntrySubject(subject, entrySubject, depth) {
        return depth && subject === entrySubject;
    }

    return Circular;
});
