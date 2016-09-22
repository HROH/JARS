JARS.internal('ResolutionStrategies', function resolutionStrategiesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        VersionResolver = getInternal('VersionResolver'),
        ResolutionHelpers = getInternal('ResolutionHelpers'),
        DependenciesResolutionStrategy = getInternal('DependenciesResolutionStrategy'),
        BundleResolutionStrategy = getInternal('BundleResolutionStrategy'),
        NestedResolutionStrategy = getInternal('NestedResolutionStrategy'),
        Utils = getInternal('Utils'),
        objectEach = Utils.objectEach,
        arrayEach = Utils.arrayEach,
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${mod}": ',
        MSG_VERSION_RESOLUTION_ERROR = 'a version must not be added when the parent is already versioned',
        ResolutionStrategies;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ResolutionStrategies = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.ModuleDependencies.Declaration|JARS.internals.ModuleBundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
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
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
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
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        object: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
                var tmpBaseModuleName = ResolutionStrategies.string(baseModule, moduleName, resolutionStrategy)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(ResolutionStrategies.any(baseModule.loader.getModule(tmpBaseModuleName), nestedModules, NestedResolutionStrategy));
                }
            });

            return resolvedModules;
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        string: function(baseModule, moduleName, resolutionStrategy) {
            var isValidModuleName = false,
                isVersionError = false,
                logger = (resolutionStrategy === BundleResolutionStrategy ? baseModule.bundle : baseModule).logger,
                resolvedModules, absoluteModuleName;

            if(!ResolutionHelpers.isRelative(moduleName) && resolutionStrategy === DependenciesResolutionStrategy) {
                isValidModuleName = true;
                absoluteModuleName = moduleName;
            }
            else if(!baseModule.isRoot) {
                if(VersionResolver.getVersion(baseModule.name) && VersionResolver.getVersion(moduleName)) {
                    isVersionError = true;
                }
                else {
                    absoluteModuleName = resolutionStrategy.resolve(baseModule, moduleName);
                }

                isValidModuleName = !!absoluteModuleName;
            }

            if (isValidModuleName) {
                resolvedModules = [absoluteModuleName];
            }
            else {
                logger.error(MSG_DEFAULT_RESOLUTION_ERROR + (isVersionError ? MSG_VERSION_RESOLUTION_ERROR : resolutionStrategy.errorMessage), {
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
        }
    };

    /**
     * @interface JARS.internals.ResolutionStrategy
     */

    /**
     * @member {string} JARS.internals.ResolutionStrategy#errorMessage
     */

    /**
     * @method JARS.internals.ResolutionStrategy#resolve
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */

    return ResolutionStrategies;
});
