JARS.internal('Module', function moduleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        AutoAborter = getInternal('AutoAborter'),
        System = getInternal('System'),
        SourceManager = getInternal('SourceManager'),
        Recoverer = getInternal('Recoverer'),
        DependenciesResolver = getInternal('DependenciesResolver'),
        ModuleDependencies = getInternal('ModuleDependencies'),
        ModuleBundle = getInternal('ModuleBundle'),
        ModuleConfig = getInternal('ModuleConfig'),
        ModuleLogger = getInternal('ModuleLogger'),
        State = getInternal('State'),
        SEPARATOR = '" -> "',
        // Errors when module is aborted
        MSG_MODULE_ABORTED = 'given path "${path}" after ${sec} second(s) - file may not exist',
        MSG_MODULE_DEPENDENCY_ABORTED = 'dependency "${dep}"',
        MSG_MODULE_CIRCULAR_DEPENDENCIES_ABORTED = 'circular dependencies "${deps}"';

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
     * @param {JARS.internals.Loader} loader
     * @param {string} moduleName
     * @param {boolean} [isRoot=false]
     */
    function Module(loader, moduleName, isRoot) {
        var module = this,
            dependencies, bundleConfig, logger, state, parent;

        module.loader = loader;
        module.name = moduleName;
        module.isRoot = isRoot || false;

        module.logger = logger = new ModuleLogger(moduleName);
        module.state = state = new State(moduleName, logger);

        module.deps = dependencies = new ModuleDependencies(module, logger);

        parent = dependencies.parent;
        module.bundle = new ModuleBundle(module, parent && parent.bundle.config);
        bundleConfig = module.bundle.config;
        module.config = module.isRoot ? bundleConfig : new ModuleConfig(module, bundleConfig);
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
                path = config.get('basePath') + config.get('dirPath') + config.get('versionDir'),
                fileName = config.get('fileName') + config.get('minified') + (fileType || config.get('extension')) + cache;

            return path + fileName;
        },

        load: function() {
            var module = this;

            AutoAborter.setup(module);

            SourceManager.loadSource(module.name, module.getFullPath());
        },
        /**
         * @param {JARS.internals.StateQueue.SuccessCallback} onModuleLoaded
         * @param {JARS.internals.StateQueue.FailCallback} onModuleAborted
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
         * @param {(string|string[])} [dependencyOrArray]
         */
        abort: function(dependencyOrArray) {
            var module = this,
                state = module.state,
                abortionMessageAndInfo;

            if (!module.isRoot && ((state.isLoading() && !Recoverer.recover(module)) || state.isRegistered())) {
                abortionMessageAndInfo = getAbortionMessageAndInfo(module, dependencyOrArray);

                state.setAborted(abortionMessageAndInfo[0], abortionMessageAndInfo[1]);
            }
        },
        /**
         * @param {JARS.internals.ModuleDependencies.Declaration} dependencies
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
                loader = module.loader,
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

                            loader.setCurrentModuleName(moduleName);

                            module.ref = parentRef[DependenciesResolver.removeParentName(moduleName)] = factory ? factory.apply(parentRef, dependencyRefs) || {} : {};

                            loader.setCurrentModuleName();
                        }

                        state.setLoaded();
                    }
                });
            }
        }
    };

    /**
     * @memberof JARS.internals.Module
     * @inner
     *
     * @param {JARS.internals.Module} module
     * @param dependencyOrArray {(string|string[])}
     *
     * @return {Array}
     */
    function getAbortionMessageAndInfo(module, dependencyOrArray) {
        return module.state.isRegistered() ? (System.isArray(dependencyOrArray) ? [MSG_MODULE_CIRCULAR_DEPENDENCIES_ABORTED, {
            deps: dependencyOrArray.join(SEPARATOR)
        }] : [MSG_MODULE_DEPENDENCY_ABORTED, {
            dep: dependencyOrArray
        }]) : [MSG_MODULE_ABORTED, {
            path: SourceManager.removeSource(module.name),

            sec: module.config.get('timeout')
        }];
    }

    return Module;
});
