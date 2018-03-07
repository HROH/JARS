JARS.internal('Handlers/Subjects/Dependencies', function(getInternal) {
    'use strict';

    var SubjectHandler = getInternal('Handlers/Subjects/Subject'),
        CircularTraverser = getInternal('Traverser/Circular'),
        ModulesTraverser = getInternal('Traverser/Modules'),
        CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = 'found circular dependencies "${0}"',
        MSG_STRINGS = ['dependency', 'dependencies'];

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject~Provide} provide
     */
    function Dependencies(subject, provide) {
        var circularDependencies = getCircularDependencies(subject.requestor);

        return new SubjectHandler(subject, circularDependencies ? [] : subject.dependencies.getAll(), MSG_STRINGS, circularDependencies ? function() {
            subject.state.setAborted(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [circularDependencies.join(CIRCULAR_SEPARATOR)]);
        } : function(refs) {
            if(!subject.state.isLoaded()) {
                subject.ref.init(refs, provide);
                subject.state.setLoaded();
            }
        });
    }

    /**
     * @memberof JARS~internals.Handlers.Subjects
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} entryModule
     *
     * @return {(string[]|boolean)}
     */
    function getCircularDependencies(entryModule) {
        return !entryModule.isRoot && entryModule.config.get('checkCircularDeps') && ModulesTraverser(entryModule, CircularTraverser);
    }

    return Dependencies;
});
