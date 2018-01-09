JARS.internal('Subjects/Module', function(getInternal) {
    'use strict';

    var Dependencies = getInternal('Subjects/Dependencies/Module'),
        InterceptionDependencies = getInternal('Subjects/Dependencies/Interception'),
        Bundle = getInternal('Subjects/Bundle'),
        SubjectHelper = getInternal('Helpers/Subject'),
        ModuleRef = getInternal('Refs/Module');

    /**
     * @callback Factory
     *
     * @memberof JARS~internals.Subjects.Module
     * @inner
     *
     * @param {...*} dependencyRefs
     *
     * @return {*}
     */

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects
     *
     * @param {string} moduleName
     * @param {boolean} [isRoot=false]
     */
    function Module(moduleName, isRoot) {
        var module = this;

        module.name = moduleName;
        module.isRoot = isRoot || false;
        module._meta = {};
        module.deps = new Dependencies(module);
        module.interceptionDeps = new InterceptionDependencies(module);
        module.bundle = new Bundle(module);

        SubjectHelper.addToModule(module);
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @param {Object} meta
         */
        setMeta: function(meta) {
            this._meta = meta;
        },
        /**
         * @param {string} metaProp
         *
         * @return {*}
         */
        getMeta: function(metaProp) {
            return this._meta[metaProp];
        },
        /**
         * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} dependencies
         */
        $import: function(dependencies) {
            (this.state.isWaiting() || this.state.isLoading()) && this.deps.add(dependencies);
        },
        /**
         * @param {JARS~internals.Subjects.Module~Factory} factory
         */
        $export: function(factory) {
            var module = this;

            module.processor.register(function onDependenciesLoaded(dependencyRefs) {
                if (!module.state.isLoaded()) {
                    module.ref = new ModuleRef(module, dependencyRefs, factory);
                    module.state.setLoaded();
                }
            });
        }
    };

    return Module;
});
