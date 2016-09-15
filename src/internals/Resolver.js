JARS.internal('Resolver', function resolverSetup(InternalsManager) {
    'use strict';

    var ROOT_MODULE_NAME = '*',
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        DOT = '.',
        VERSION_DELIMITER = '@',
        VERSION_WITH_ZERO_PATCH = '$10',
        RE_VERSION_WITHOUT_PATCH_NUMBER = /(\d+\.\d+\.)\d+.+/,
        RE_BUNDLE = /\.\*$/,
        ResolutionStrategies = InternalsManager.get('ResolutionStrategies'),
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
        getBundleName: function(moduleName) {
            return Resolver.appendVersion(Resolver.getModuleNameWithoutVersion(moduleName) + BUNDLE_SUFFIX, Resolver.getVersion(moduleName));
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getImplicitDependencyName: function(moduleName) {
            var version = Resolver.getVersion(moduleName),
                moduleNameWithoutVersion = Resolver.getModuleNameWithoutVersion(moduleName),
                implicitDependencyWithoutVersion = moduleNameWithoutVersion.substr(0, moduleNameWithoutVersion.lastIndexOf(DOT));

            version && (version = version.replace(RE_VERSION_WITHOUT_PATCH_NUMBER, VERSION_WITH_ZERO_PATCH));

            return Resolver.appendVersion(implicitDependencyWithoutVersion, version);
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getModuleTail: function(moduleName) {
            return Resolver.getModuleNameWithoutVersion(moduleName).split(DOT).pop();
        },
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isVersionedModule: function(moduleName) {
            return moduleName.indexOf(VERSION_DELIMITER) > -1;
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getModuleNameWithoutVersion: function(moduleName) {
            return moduleName.split(VERSION_DELIMITER)[0];
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getVersion: function(moduleName) {
            return moduleName.split(VERSION_DELIMITER)[1] || EMPTY_STRING;
        },
        /**
         * @param {string} moduleName
         * @param {string} version
         *
         * @return {string}
         */
        appendVersion: function(moduleName, version) {
            return (moduleName && version) ? [moduleName, version].join(VERSION_DELIMITER) : moduleName;
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        extractModuleNameFromBundle: function(moduleName) {
            return Resolver.appendVersion(Resolver.getModuleNameWithoutVersion(moduleName).replace(RE_BUNDLE, EMPTY_STRING), Resolver.getVersion(moduleName));
        },
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isBundle: function(moduleName) {
            return RE_BUNDLE.test(Resolver.getModuleNameWithoutVersion(moduleName));
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
