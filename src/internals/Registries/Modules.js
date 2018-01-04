JARS.internal('Registries/Modules', function modulesRegistrySetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        objectEach = getInternal('Utils').objectEach,
        modulesRegistry = {},
        ROOT_MODULE_NAME = '*',
        ModulesRegistry, Module, BundleResolver, removeInterceptionData, currentModule;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ModulesRegistry = {
        init: function() {
            Module = getInternal('Module');
            BundleResolver = getInternal('Resolvers/Bundle');
            removeInterceptionData = getInternal('Resolvers/Interception').removeInterceptionData;

            ModulesRegistry.getRoot().$export();
        },
        /**
         * @param {string} moduleName
         * @param {JARS.internals.Bundle.Declaration} bundleModules
         *
         * @return {JARS.internals.Module}
         */
        register: function(moduleName, bundleModules) {
            var module = ModulesRegistry.get(moduleName);

            module ? module.bundle.add(bundleModules) : System.Logger.error('No modulename provided');

            return module;
        },
        /**
         * @param {string} moduleName
         * @param {boolean} [isRoot]
         *
         * @return {JARS.internals.Module}
         */
        get: function(moduleName, isRoot) {
            moduleName = BundleResolver.isBundle(moduleName) ? BundleResolver.removeBundleSuffix(moduleName) : removeInterceptionData(moduleName);

            return moduleName ? modulesRegistry[moduleName] || (modulesRegistry[moduleName] = new Module(moduleName, isRoot)) : null;
        },
        /**
         * @return {JARS.internals.Module}
         */
        getRoot: function() {
            return ModulesRegistry.get(ROOT_MODULE_NAME, true);
        },
        /**
         * @param {JARS.internals.Module} module
         */
        setCurrent: function(module) {
            currentModule = module || ModulesRegistry.getRoot();
        },
        /**
         * @return {JARS.internals.Module} module
         */
        getCurrent: function() {
            return currentModule;
        },
        /**
         * @param {function(JARS.internals.Module, string)} callback
         */
        each: function(callback) {
            objectEach(modulesRegistry, callback);
        }
    };

    return ModulesRegistry;
});
