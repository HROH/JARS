JARS.internal('ModulesRegistry', function modulesRegistrySetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        objectEach = getInternal('Utils').objectEach,
        modulesRegistry = {},
        ROOT_MODULE_NAME = '*',
        ModulesRegistry, Module, InterceptionManager, BundleResolver, currentModule;

    ModulesRegistry = {
        /**
         * @param {string} moduleName
         * @param {JARS.internals.Bundle.Declaration} bundleModules
         *
         * @return {JARS.internals.Module}
         */
        register: function(moduleName, bundleModules) {
            var module = ModulesRegistry.get(moduleName);

            if(module) {
                module.bundle.add(bundleModules);
            }
            else {
                System.Logger.error('No modulename provided');
            }

            return module;
        },
        /**
         * @param {string} moduleName
         * @param {boolean} [isRoot]
         *
         * @return {JARS.internals.Module}
         */
        get: function(moduleName, isRoot) {
            initializeModulesRegistry();

            if (BundleResolver.isBundle(moduleName)) {
                moduleName = BundleResolver.removeBundle(moduleName);
            }
            else {
                moduleName = InterceptionManager.removeInterceptionData(moduleName);
            }

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

    function initializeModulesRegistry() {
        if(!(Module && InterceptionManager && BundleResolver)) {
            Module = getInternal('Module');
            InterceptionManager = getInternal('InterceptionManager');
            BundleResolver = getInternal('BundleResolver');
        }
    }

    return ModulesRegistry;
});
