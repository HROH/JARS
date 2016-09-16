JARS.internal('Resolver', function resolverSetup(InternalsManager) {
    'use strict';

    var ROOT_MODULE_NAME = '*',
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        DOT = '.',
        RE_BUNDLE = /\.\*$/,
        ResolutionStrategies = InternalsManager.get('ResolutionStrategies'),
        VersionResolver = InternalsManager.get('VersionResolver'),
        Resolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    Resolver = {
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isRootName: function(moduleName) {
            return ROOT_MODULE_NAME === moduleName;
        },
        /**
         * @return {string}
         */
        getRootName: function() {
            return ROOT_MODULE_NAME;
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getBundleName: VersionResolver.unwrapVersion(function getBundleName(moduleName) {
            return moduleName + BUNDLE_SUFFIX;
        }),
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getParentName: VersionResolver.unwrapVersion(function getParentName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf(DOT));
        }),
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getModuleTail: function(moduleName) {
            return VersionResolver.removeVersion(moduleName).split(DOT).pop();
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeBundle: VersionResolver.unwrapVersion(function(moduleName) {
            return moduleName.replace(RE_BUNDLE, EMPTY_STRING);
        }),
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isBundle: function(moduleName) {
            return RE_BUNDLE.test(VersionResolver.removeVersion(moduleName));
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {JARS.internals.ModuleDependencies.Declaration} modules
         *
         * @return {string[]}
         */
        resolve: function(baseModule, modules) {
            return ResolutionStrategies.any(baseModule, modules, ResolutionStrategies.deps);
        },
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {JARS.internals.ModuleBundle.Declaration} bundleModules
         *
         * @return {string[]}
         */
        resolveBundle: function(baseModule, bundleModules) {
            return ResolutionStrategies.array(baseModule, bundleModules || [], ResolutionStrategies.bundle);
        }
    };

    return Resolver;
});
