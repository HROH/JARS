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
            dependencies = circularDependencies ? [] : subject.dependencies.getAll(),
            stateUpdater = subject.stateUpdater,
            completionHandler = circularDependencies ? new DependenciesAborted(stateUpdater, circularDependencies) : new DependenciesCompleted(subject.state, stateUpdater, subject.ref, provide);

        return new SubjectHandler(subject, dependencies, MSG_STRINGS, completionHandler);
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
