JARS.internal('Module', function moduleSetup(getInternal) {
    'use strict';

    var ModulesRegistry = getInternal('ModulesRegistry'),
        Dependencies = getInternal('Dependencies'),
        Bundle = getInternal('Bundle'),
        Tools = getInternal('Tools');

    /**
     * @callback ModuleFactory
     *
     * @memberof JARS.internals.Module
     *
     * @param {...*} dependencyRefs
     *
     * @return {*}
     */

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {string} moduleName
     * @param {boolean} [isRoot=false]
     */
    function Module(moduleName, isRoot) {
        var module = this;

        module.name = moduleName;
        module.isRoot = isRoot || false;
        module.deps = new Dependencies(module);
        module.interceptionDeps = new Dependencies(module);
        module.bundle = new Bundle(module);

        Tools.addToModule(module);
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @param {JARS.internals.Dependencies.Declaration} dependencies
         */
        $import: function(dependencies) {
            var state = this.state;

            if (!(state.isRegistered() || state.isLoaded())) {
                this.deps.add(dependencies);
            }
        },
        /**
         * @param {JARS.internals.Module.ModuleFactory} factory
         */
        $export: function(factory) {
            var module = this;

            module.processor.register(function onDependenciesLoaded(dependencyRefs) {
                if (!module.state.isLoaded()) {
                    ModulesRegistry.setCurrent(module);

                    module.ref = (!module.isRoot && factory) ? (factory.apply(dependencyRefs.shift(), dependencyRefs) || {}) : {};

                    ModulesRegistry.setCurrent();
                    module.state.setLoaded();
                }
            });
        }
    };

    return Module;
});
