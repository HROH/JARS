JARS.internal('Module', function moduleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        AutoAborter = getInternal('AutoAborter'),
        SourceManager = getInternal('SourceManager'),
        ModulesRegistry = getInternal('ModulesRegistry'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        Dependencies = getInternal('Dependencies'),
        Bundle = getInternal('Bundle'),
        Config = getInternal('Config'),
        Logger = getInternal('Logger'),
        State = getInternal('State');

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
            dependencies, bundleConfig, logger, state, parent;

        module.name = moduleName;
        module.isRoot = isRoot || false;

        module.logger = logger = new Logger(moduleName);
        module.state = state = new State(moduleName, logger);

        module.deps = dependencies = new Dependencies(module, logger);

        parent = dependencies.parent;
        module.bundle = new Bundle(module, parent && parent.bundle.config);
        bundleConfig = module.bundle.config;
        module.config = isRoot ? bundleConfig : new Config(module, bundleConfig);
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @param {string} [fileType]
         *
         * @return {string}
         */
        getFullPath: function(fileType) {
            var module = this,
                config = module.config,
                cache = config.get('cache') ? '' : '?_=' + new Date().getTime(),
                path = [config.get('basePath'), config.get('dirPath'), config.get('versionDir')].join(''),
                fileName = [config.get('fileName'), config.get('minified'), (fileType || config.get('extension')), cache].join('');

            return path + fileName;
        },

        load: function() {
            var module = this,
                path = module.getFullPath();

            AutoAborter.setup(module, path);

            SourceManager.loadSource(module.name, path);
        },
        /**
         * @param {JARS.internals.State.LoadedCallback} onModuleLoaded
         * @param {JARS.internals.State.AbortedCallback} onModuleAborted
         */
        request: function(onModuleLoaded, onModuleAborted) {
            var module = this,
                state = module.state;

            if (state.trySetRequested({
                path: module.getFullPath()
            })) {
                module.load();
            }

            state.onChange(onModuleLoaded, onModuleAborted);
        },
        /**
         * @param {JARS.internals.Dependencies.Declaration} dependencies
         */
        $import: function(dependencies) {
            var module = this;

            if (!module.state.isRegistered()) {
                module.deps.add(dependencies);
            }
        },
        /**
         * @param {JARS.internals.Module.FactoryCallback} factory
         */
        $export: function(factory) {
            var module = this,
                state = module.state,
                moduleName = module.name,
                parentRef;

            if (state.trySetRegistered()) {
                AutoAborter.clear(module);

                module.deps.request(function onDependenciesLoaded(dependencyRefs) {
                    if (state.isRegistered() && !state.isLoaded()) {
                        if(module.isRoot) {
                            module.ref = {};
                        }
                        else {
                            parentRef = dependencyRefs.shift();

                            ModulesRegistry.setCurrent(module);

                            module.ref = parentRef[DependenciesResolver.removeParentName(moduleName)] = factory ? factory.apply(parentRef, dependencyRefs) || {} : {};

                            ModulesRegistry.setCurrent();
                        }

                        state.setLoaded();
                    }
                });
            }
        }
    };

    return Module;
});
