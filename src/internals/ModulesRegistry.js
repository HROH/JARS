JARS.internal('ModulesRegistry', function modulesRegistrySetup(getInternal) {
    'use strict';

    var System = getInternal('System'),
        objectEach = getInternal('Utils').objectEach,
        modulesRegistry = {},
        ROOT_MODULE_NAME = '*',
        ModulesRegistry, Module, InterceptionResolver, BundleResolver, currentModule;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ModulesRegistry = {
        init: function() {
            Module = getInternal('Module');
            InterceptionResolver = getInternal('InterceptionResolver');
            BundleResolver = getInternal('BundleResolver');

            ModulesRegistry.getRoot().$export();

            ModulesRegistry.register('System', ['Formatter', 'Logger', 'Modules']).$export(function systemFactory() {
                // TODO maybe calling the internal factory for System is the better option
                // to isolate System on a per context basis but right now this is enough

                /**
                 * @global
                 * @module System
                 * @see JARS.internals.System
                 */
                return System;
            });
        },
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
            if (BundleResolver.isBundle(moduleName)) {
                moduleName = BundleResolver.removeBundleSuffix(moduleName);
            }
            else {
                moduleName = InterceptionResolver.removeInterceptionData(moduleName);
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

    return ModulesRegistry;
});
