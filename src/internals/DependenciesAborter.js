JARS.internal('DependenciesAborter', function dependenciesAborterSetup() {
    'use strict';

    var CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_BY_DEPENDENCY = ' - missing dependency "${0}"',
        MSG_ABORTED_BY_CIRCULAR_DEPENDENCIES = ' - found circular dependencies "${0}"',
        DependenciesAborter;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    DependenciesAborter = {
        /**
         * @param {JARS.internals.Module} module
         * @param {string} dependencyName
         */
        abortByDependency: function(module, dependencyName) {
            module.state.setAborted(MSG_ABORTED_BY_DEPENDENCY, [dependencyName]);
        },
        /**
         * @param {JARS.internals.Module} module
         * @param {string[]} circularDependencies
         */
        abortByCircularDeps: function(module, circularDependencies) {
            module.state.setAborted(MSG_ABORTED_BY_CIRCULAR_DEPENDENCIES, [circularDependencies.join(CIRCULAR_SEPARATOR)]);
        }
    };

    return DependenciesAborter;
});
