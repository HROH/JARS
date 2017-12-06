JARS.internal('Module', function moduleSetup(getInternal) {
    'use strict';

    var AutoAborter = getInternal('AutoAborter'),
        SourceManager = getInternal('SourceManager'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        Dependencies = getInternal('Dependencies'),
        Bundle = getInternal('Bundle'),
        Config = getInternal('Config'),
        LogWrap = getInternal('LogWrap'),
        State = getInternal('State'),
        PathManager = getInternal('PathManager'),
        LOG_CONTEXT_PREFIX = 'Module:';

    /**
     * @callback FactoryCallback
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
        var module = this,
            bundleConfig, parent;

        module.name = moduleName;
        module.isRoot = isRoot || false;

        module.logger = new LogWrap(LOG_CONTEXT_PREFIX + moduleName);
        module.state = new State(moduleName, module.logger);

        module.deps = new Dependencies(module);
        module.interceptionDeps = new Dependencies(module, true);

        parent = module.deps.parent;
        module.bundle = new Bundle(module, parent && parent.bundle.config);
        bundleConfig = module.bundle.config;
        module.config = isRoot ? bundleConfig : new Config(module, bundleConfig);
    }

    Module.prototype = {
        constructor: Module,

        load: function() {
            var module = this,
                path = PathManager.getFullPath(module);

            AutoAborter.setup(module, path);

            SourceManager.load(module.name, path);
        },
        /**
         * @param {JARS.internals.State.LoadedCallback} onModuleLoaded
         * @param {JARS.internals.State.AbortedCallback} onModuleAborted
         */
        request: function(onModuleLoaded, onModuleAborted) {
            var module = this,
                state = module.state;

            if (state.setLoading()) {
                module.load();
            }

            state.onChange(onModuleLoaded, onModuleAborted);
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} dependencies
         */
        $import: function(dependencies) {
            var module = this,
                state = module.state;

            if (!(state.isRegistered() || state.isLoaded())) {
                module.deps.add(dependencies);
            }
        },
        /**
         * @param {JARS.internals.Module.FactoryCallback} factory
         */
        $export: function(factory) {
            var module = this,
                state = module.state;

            if (state.setRegistered()) {
                AutoAborter.clear(module);

                module.deps.request(function onDependenciesLoaded(dependencyRefs) {
                    if (state.setLoaded()) {
                        ModulesRegistry.setCurrent(module);

                        module.ref = (!module.isRoot && factory) ? (factory.apply(dependencyRefs.shift(), dependencyRefs) || {}) : {};
                        module.deps.linkRefToParent(module.ref);

                        ModulesRegistry.setCurrent();
                    }
                });
            }
        }
    };

    return Module;
});
