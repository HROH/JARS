JARS.internal('DependenciesChecker', function(getInternal) {
    'use strict';

    var CircularTraverser = getInternal('Traverser/Circular'),
        traverse = getInternal('Traverser/Modules').traverse,
        CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = ' - found circular dependencies "${0}"',
        DependenciesChecker;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     */
    DependenciesChecker = {
        /**
         * @param {JARS~internals.Module} module
         *
         * @return {boolean}
         */
        abortIfCircular: function(module) {
            var circularDeps;

            if(!module.isRoot && module.config.get('checkCircularDeps')) {
                circularDeps = traverse(module, CircularTraverser);
                circularDeps && module.state.setAborted(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [circularDeps.join(CIRCULAR_SEPARATOR)]);
            }

            return !!circularDeps;
        }
    };

    return DependenciesChecker;
});
