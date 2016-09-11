JARS.internal('ResolutionStrategies', function resolutionStrategiesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        utils = getInternal('utils'),
        objectEach = utils.objectEach,
        arrayEach = utils.arrayEach,
        EMPTY_STRING = '',
        DOT = '.',
        RE_LEADING_DOT = /^\./,
        RESOLUTION_LOG_CONTEXT = 'Resolution',
        MUST_NOT_START_WITH_DOT = 'modulename must not start with a "."',
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${0}" relative to "${1}": ',
        MSG_BUNDLE_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a bundle ' + MUST_NOT_START_WITH_DOT,
        MSG_DEPS_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a dependency modulename must be absolute or relative to the current module',
        MSG_NESTED_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a nested ' + MUST_NOT_START_WITH_DOT + ' or only contain it as a special symbol',
        ResolutionStrategies;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ResolutionStrategies = {
        /**
         * @param {string} baseModuleName
         * @param {(JARS.internals.ModuleDependencies.Declaration|JARS.internals.ModuleBundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        any: function(baseModuleName, modules, resolutionStrategy) {
            var typeResolutionStrategy = ResolutionStrategies[System.getType(modules)];

            return typeResolutionStrategy(baseModuleName, modules, resolutionStrategy);
        },
        /**
         * @param {string} baseModuleName
         * @param {(JARS.internals.ModuleDependencies.Declaration[]|JARS.internals.ModuleBundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        array: function(baseModuleName, modules, resolutionStrategy) {
            var resolvedModules = [];

            arrayEach(modules, function concatResolvedModules(nestedModules) {
                resolvedModules = resolvedModules.concat(ResolutionStrategies.any(baseModuleName, nestedModules, resolutionStrategy));
            });

            return resolvedModules;
        },
        /**
         * @param {string} baseModuleName
         * @param {Object<string, JARS.internals.ModuleDependencies.Declaration>} modules
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        object: function(baseModuleName, modules, resolutionStrategy) {
            var resolvedModules = [];

            objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
                var tmpBaseModuleName = ResolutionStrategies.string(baseModuleName, moduleName, resolutionStrategy)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(ResolutionStrategies.any(tmpBaseModuleName, nestedModules, ResolutionStrategies.nested));
                }
            });

            return resolvedModules;
        },
        /**
         * @param {string} baseModuleName
         * @param {string} moduleName
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        string: function(baseModuleName, moduleName, resolutionStrategy) {
            var isRelative = isRelativeModuleName(moduleName),
                isValidModuleName = false,
                resolvedModules, absoluteModuleName;

            if (!baseModuleName) {
                if(!isRelative && resolutionStrategy === ResolutionStrategies.deps) {
                    isValidModuleName = true;
                    absoluteModuleName = moduleName;
                }
            }
            else {
                absoluteModuleName = resolutionStrategy(baseModuleName, moduleName);

                isValidModuleName = !!absoluteModuleName;
            }

            if (isValidModuleName) {
                resolvedModules = [absoluteModuleName];
            }
            else {
                logResolutionError(baseModuleName, moduleName, resolutionStrategy);

                resolvedModules = [];
            }

            return resolvedModules;
        },
        /**
         * @return {string[]}
         */
        undefined: function() {
            return [];
        },
        /**
         * @param {string} baseModuleName
         * @param {string} moduleName
         *
         * @return {string}
         */
        deps: function(baseModuleName, moduleName) {
            var baseParts, absoluteModuleName;

            if(isRelativeModuleName(moduleName)) {
                baseParts = baseModuleName.split(DOT);

                if(!isRelativeModuleName(baseModuleName)) {
                    while (baseParts.length && isRelativeModuleName(moduleName)) {
                        moduleName = moduleName.substr(1);
                        baseParts.pop();
                    }

                    if(!isRelativeModuleName(moduleName) && (moduleName || baseParts.length)) {
                        baseModuleName = baseParts.join(DOT);

                        absoluteModuleName = makeAbsoluteModuleName(baseModuleName, moduleName);
                    }
                }
            }
            else {
                absoluteModuleName = moduleName;
            }

            return absoluteModuleName;
        },
        /**
         * @param {string} baseModuleName
         * @param {string} moduleName
         *
         * @return {string}
         */
        nested: function(baseModuleName, moduleName) {
            var absoluteModuleName;

            // self reference
            if(moduleName === DOT) {
                absoluteModuleName = baseModuleName;
            }
            else if (!isRelativeModuleName(moduleName)) {
                absoluteModuleName = makeAbsoluteModuleName(baseModuleName, moduleName);
            }

            return absoluteModuleName;
        },
        /**
         * @param {string} baseModuleName
         * @param {string} moduleName
         *
         * @return {string}
         */
        bundle: function(baseModuleName, moduleName) {
            return isRelativeModuleName(moduleName) ? EMPTY_STRING : makeAbsoluteModuleName(baseModuleName, moduleName);
        }
    };

    /**
     * @private
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {string} baseModuleName
     * @param {string} moduleName
     *
     * @return {string}
     */
    function makeAbsoluteModuleName(baseModuleName, moduleName) {
        var separator = getInternal('InterceptionManager').removeInterceptionData(moduleName) ? DOT : EMPTY_STRING;

        return [baseModuleName, moduleName].join(separator);
    }

    /**
     * @private
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {string} moduleName
     *
     * @return {boolean}
     */
    function isRelativeModuleName(moduleName) {
        return RE_LEADING_DOT.test(moduleName);
    }

    /**
     * @private
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {string} baseModuleName
     * @param {string} moduleName
     * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
     */
    function logResolutionError(baseModuleName, moduleName, resolutionStrategy) {
        var Logger = System.Logger,
            message;

        switch(resolutionStrategy) {
            case ResolutionStrategies.bundle:
                message = MSG_BUNDLE_RESOLUTION_ERROR;
                break;
            case ResolutionStrategies.deps:
                message = MSG_DEPS_RESOLUTION_ERROR;
                break;
            case ResolutionStrategies.nested:
                message = MSG_NESTED_RESOLUTION_ERROR;
                break;
            default:
                message = MSG_DEFAULT_RESOLUTION_ERROR;
        }

        Logger && Logger.errorWithContext(RESOLUTION_LOG_CONTEXT, message, [moduleName, baseModuleName]);
    }

    /**
     * @callback ResolutionStrategy
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {string} baseModuleName
     * @param {string} moduleName
     *
     * @return {string[]}
     */

    return ResolutionStrategies;
});
