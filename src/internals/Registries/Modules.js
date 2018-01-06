JARS.internal('Registries/Modules', function modulesRegistrySetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        BundleResolver = getInternal('Resolvers/Bundle'),
        removeInterceptionData = getInternal('Resolvers/Interception').removeInterceptionData,
        each = getInternal('Helpers/Object').each,
        modules = {},
        ROOT_MODULE_NAME = '*',
        Modules, currentModule;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries
     */
    Modules = {
        /**
         * @param {string} moduleName
         * @param {JARS~internals.Bundle~Declaration} bundleModules
         *
         * @return {JARS~internals.Module}
         */
        register: function(moduleName, bundleModules) {
            var module = Modules.get(moduleName);

            module ? module.bundle.add(bundleModules) : System.Logger.error('No modulename provided');

            return module;
        },
        /**
         * @param {string} moduleName
         * @param {boolean} [isRoot]
         *
         * @return {JARS~internals.Module}
         */
        get: function(moduleName, isRoot) {
            moduleName = BundleResolver.isBundle(moduleName) ? BundleResolver.removeBundleSuffix(moduleName) : removeInterceptionData(moduleName);

            return moduleName ? modules[moduleName] || (modules[moduleName] = new Modules.Module(moduleName, isRoot)) : null;
        },
        /**
         * @return {JARS~internals.Module}
         */
        getRoot: function() {
            return Modules.get(ROOT_MODULE_NAME, true);
        },
        /**
         * @param {JARS.internals~Module} module
         */
        setCurrent: function(module) {
            currentModule = module || Modules.getRoot();
        },
        /**
         * @return {JARS~internals.Module} module
         */
        getCurrent: function() {
            return currentModule;
        },
        /**
         * @param {function(JARS~internals.Module, string)} callback
         */
        each: function(callback) {
            each(modules, callback);
        }
    };

    return Modules;
});
