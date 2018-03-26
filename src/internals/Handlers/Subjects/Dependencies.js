JARS.internal('Handlers/Subjects/Dependencies', function(getInternal) {
    'use strict';

    var SubjectHandler = getInternal('Handlers/Subjects/Subject'),
        DependenciesCompleted = getInternal('Handlers/Subjects/DependenciesCompleted'),
        DependenciesAborted = getInternal('Handlers/Subjects/DependenciesAborted'),
        CircularTraverser = getInternal('Traverser/Circular'),
        ModulesTraverser = getInternal('Traverser/Modules'),
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
        var circularDependencies = getCircularDependencies(subject.requestor),
            completionHandler = circularDependencies ? new DependenciesAborted(subject, circularDependencies) : new DependenciesCompleted(subject, provide);

        return new SubjectHandler(subject, circularDependencies ? [] : subject.dependencies.getAll(), MSG_STRINGS, completionHandler);
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
