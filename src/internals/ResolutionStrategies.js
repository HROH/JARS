JARS.internal('ResolutionStrategies', function resolutionStrategiesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        VersionResolver = getInternal('VersionResolver'),
        Utils = getInternal('Utils'),
        objectEach = Utils.objectEach,
        arrayEach = Utils.arrayEach,
        EMPTY_STRING = '',
        DOT = '.',
        RE_LEADING_DOT = /^\./,
        MUST_NOT_START_WITH_DOT = 'modulename must not start with a "."',
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${mod}": ',
        MSG_BUNDLE_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a bundle ' + MUST_NOT_START_WITH_DOT,
        MSG_DEPS_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a dependency modulename must be absolute or relative to the current module',
        MSG_NESTED_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a nested ' + MUST_NOT_START_WITH_DOT + ' or only contain it as a special symbol',
        MSG_VERSION_RESOLUTION_ERROR = MSG_DEFAULT_RESOLUTION_ERROR + 'a version must not be added when the parent is already versioned',
        ResolutionStrategies;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     *
     * @borrows JARS.internals.ResolutionStrategies~makeAbsoluteModuleName as bundle
     */
    ResolutionStrategies = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.ModuleDependencies.Declaration|JARS.internals.ModuleBundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        any: function(baseModule, modules, resolutionStrategy) {
            var typeResolutionStrategy = ResolutionStrategies[System.getType(modules)];

            return typeResolutionStrategy(baseModule, modules, resolutionStrategy);
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.ModuleDependencies.Declaration[]|JARS.internals.ModuleBundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        array: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            arrayEach(modules, function concatResolvedModules(nestedModules) {
                resolvedModules = resolvedModules.concat(ResolutionStrategies.any(baseModule, nestedModules, resolutionStrategy));
            });

            return resolvedModules;
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {Object<string, JARS.internals.ModuleDependencies.Declaration>} modules
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        object: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
                var tmpBaseModuleName = ResolutionStrategies.string(baseModule, moduleName, resolutionStrategy)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(ResolutionStrategies.any(baseModule.loader.getModule(tmpBaseModuleName), nestedModules, ResolutionStrategies.nested));
                }
            });

            return resolvedModules;
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        string: function(baseModule, moduleName, resolutionStrategy) {
            var isValidModuleName = false,
                isVersionError = false,
                logger = (resolutionStrategy === ResolutionStrategies.bundle ? baseModule.bundle : baseModule).logger,
                resolvedModules, absoluteModuleName;


            if(!isRelativeModuleName(moduleName) && resolutionStrategy === ResolutionStrategies.deps) {
                isValidModuleName = true;
                absoluteModuleName = moduleName;
            }
            else if(!baseModule.isRoot) {
                if(VersionResolver.getVersion(baseModule.name) && VersionResolver.getVersion(moduleName)) {
                    isVersionError = true;
                }
                else {
                    absoluteModuleName = resolutionStrategy(baseModule, moduleName);
                }

                isValidModuleName = !!absoluteModuleName;
            }

            if (isValidModuleName) {
                resolvedModules = [absoluteModuleName];
            }
            else {
                logger.error(isVersionError ? MSG_VERSION_RESOLUTION_ERROR : getResolutionStrategyError(resolutionStrategy), {
                    mod: moduleName
                });

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
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        deps: function(baseModule, moduleName) {
            return (!baseModule.isRoot && isRelativeModuleName(moduleName)) ? ResolutionStrategies.deps(baseModule.deps.parent, moduleName.substr(1)) : makeAbsoluteModuleName(baseModule, moduleName);
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        nested: function(baseModule, moduleName) {
            return moduleName === DOT ? baseModule.name : makeAbsoluteModuleName(baseModule, moduleName);
        },

        bundle: makeAbsoluteModuleName
    };

    /**
     * @memberof JARS.internals.ResolutionStrategies
     * @inner
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function makeAbsoluteModuleName(baseModule, moduleName) {
        var separator = getInternal('InterceptionManager').removeInterceptionData(moduleName) ? DOT : EMPTY_STRING;

        return (baseModule.isRoot || isRelativeModuleName(moduleName)) ? EMPTY_STRING : VersionResolver.unwrapVersion(function(baseModuleName) {
            return [baseModuleName, moduleName].join(separator);
        })(baseModule.name);
    }

    /**
     * @memberof JARS.internals.ResolutionStrategies
     * @inner
     *
     * @param {string} moduleName
     *
     * @return {boolean}
     */
    function isRelativeModuleName(moduleName) {
        return RE_LEADING_DOT.test(moduleName);
    }

    /**
     * @memberof JARS.internals.ResolutionStrategies
     * @inner
     *
     * @param {JARS.internals.ResolutionStrategies.ResolutionStrategy} resolutionStrategy
     */
    function getResolutionStrategyError(resolutionStrategy) {
        var message;

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

        return message;
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
