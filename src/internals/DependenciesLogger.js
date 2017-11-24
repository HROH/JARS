JARS.internal('DependenciesLogger', function(getInternal) {
    'use strict';

    var LogWrap = getInternal('LogWrap'),
        LOG_CONTEXT_PREFIX = 'Dependencies:',
        SEPARATOR = '", "',
        EXPLICIT_DEPENDENCIES = 'explicit',
        INTERCEPTION_DEPENDENCIES = 'interception',
        MSG_DEPENDENCY_FOUND = 'found implicit dependency "${dep}"',
        MSG_DEPENDENCIES_FOUND = 'found ${kind} dependencie(s) "${deps}"';

    function DependenciesLogger(module, forInterceptionDeps) {
        this._logger = new LogWrap(LOG_CONTEXT_PREFIX + module.name);
        this._forInterceptionDeps = forInterceptionDeps;
    }

    DependenciesLogger.prototype = {
        constructor: DependenciesLogger,

        debugParentDependency: function(parentName) {
            if(parentName && !this._forInterceptionDeps) {
                this._logger.debug(MSG_DEPENDENCY_FOUND, {
                    dep: parentName
                });
            }
        },

        debugDependencies: function(dependencies) {
            dependencies.length && this._logger.debug(MSG_DEPENDENCIES_FOUND, {
                kind: this._forInterceptionDeps ? INTERCEPTION_DEPENDENCIES : EXPLICIT_DEPENDENCIES,

                deps: dependencies.join(SEPARATOR)
            });
        }
    };

    return DependenciesLogger;
});
