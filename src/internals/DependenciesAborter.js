JARS.internal('DependenciesAborter', function dependenciesAborterSetup() {
    'use strict';

    var CIRCULAR_SEPARATOR = '" -> "',
        MSG_DEPENDENCY_ABORTED = 'dependency "${dep}"',
        MSG_CIRCULAR_DEPENDENCIES_ABORTED = 'circular dependencies "${deps}"';

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.State}
     */
    function DependenciesAborter(state) {
        this._state = state;
    }

    DependenciesAborter.prototype = {
        constructor: DependenciesAborter,
        /**
         * @param {string} dependencyName
         */
        abortDependency: function(dependencyName) {
            this._state.setAborted(MSG_DEPENDENCY_ABORTED, {
                dep: dependencyName
            });
        },
        /**
         * @param {string[]} circularDependencies
         */
        abortCircularDeps: function(circularDependencies) {
            this._state.setAborted(MSG_CIRCULAR_DEPENDENCIES_ABORTED, {
                deps: circularDependencies.join(CIRCULAR_SEPARATOR)
            });
        }
    };

    return DependenciesAborter;
});
