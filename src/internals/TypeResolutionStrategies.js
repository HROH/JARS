JARS.internal('TypeResolutionStrategies', function resolutionStrategiesSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        BundleResolutionStrategy = getInternal('BundleResolutionStrategy'),
        NestedResolutionStrategy = getInternal('NestedResolutionStrategy'),
        Utils = getInternal('Utils'),
        objectEach = Utils.objectEach,
        arrayEach = Utils.arrayEach,
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${mod}": ',
        TypeResolutionStrategies;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    TypeResolutionStrategies = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.Dependencies.Declaration|JARS.internals.Bundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        any: function(baseModule, modules, resolutionStrategy) {
            var typeResolutionStrategy = TypeResolutionStrategies[System.getType(modules)];

            return typeResolutionStrategy(baseModule, modules, resolutionStrategy);
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {(JARS.internals.Dependencies.Declaration[]|JARS.internals.Bundle.Declaration)} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        array: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            arrayEach(modules, function concatResolvedModules(nestedModules) {
                resolvedModules = resolvedModules.concat(TypeResolutionStrategies.any(baseModule, nestedModules, resolutionStrategy));
            });

            return resolvedModules;
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {Object<string, JARS.internals.Dependencies.Declaration>} modules
         * @param {JARS.internals.ResolutionStrategy} resolutionStrategy
         *
         * @return {string[]}
         */
        object: function(baseModule, modules, resolutionStrategy) {
            var resolvedModules = [];

            objectEach(modules, function concatResolvedModules(nestedModules, moduleName) {
                var tmpBaseModuleName = TypeResolutionStrategies.string(baseModule, moduleName, resolutionStrategy)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(TypeResolutionStrategies.any(baseModule.loader.getModule(tmpBaseModuleName), nestedModules, NestedResolutionStrategy));
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
            var logger = (resolutionStrategy === BundleResolutionStrategy ? baseModule.bundle : baseModule).logger,
                resolutionInfo = resolutionStrategy.resolve(baseModule, moduleName),
                resolvedModules = [];

            if (resolutionInfo.error) {
                logger.error(MSG_DEFAULT_RESOLUTION_ERROR + resolutionInfo.error, {
                    mod: moduleName
                });
            }
            else {
                resolvedModules = [resolutionInfo.resolved];
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
     * @method JARS.internals.ResolutionStrategy#resolve
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */

    return TypeResolutionStrategies;
});
