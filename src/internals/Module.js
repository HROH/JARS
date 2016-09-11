JARS.internal('Module', function moduleSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        System = getInternal('System'),
        SourceManager = getInternal('SourceManager'),
        Resolver = getInternal('Resolver'),
        ModuleQueue = getInternal('ModuleQueue'),
        ModuleDependencies = getInternal('ModuleDependencies'),
        ModuleBundle = getInternal('ModuleBundle'),
        ModuleConfig = getInternal('ModuleConfig'),
        ModuleLogger = getInternal('ModuleLogger'),
        ModuleState = getInternal('ModuleState'),
        SEPARATOR = '", "',
        MSG_RECOVERING = 'failed to load and tries to recover...',
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
     */
    function Module(loader, moduleName) {
        var module = this,
            dependencies, bundleConfig, logger, state, parent;

        module.name = moduleName;
        module.loader = loader;

        module.logger = logger = new ModuleLogger(moduleName);
        module.state = state = new ModuleState(logger);
        module.queue = new ModuleQueue(moduleName, state);

        module.deps = dependencies = new ModuleDependencies(module, logger);

        parent = dependencies.parent;
        module.bundle = new ModuleBundle(moduleName, parent && parent.bundle.config);
        bundleConfig = module.bundle.config;
        module.config = module.isRoot() ? bundleConfig : new ModuleConfig(module, bundleConfig);
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @return {boolean}
         */
        isRoot: function() {
            return Resolver.isRootName(this.name);
        },
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

            module.setupAutoAbort();

            SourceManager.loadSource(module.name, module.getFullPath());
        },
        /**
         * @param {JARS.internals.ModuleQueue.SuccessCallback} onModuleLoaded
         * @param {JARS.internals.ModuleQueue.FailCallback} onModuleAborted
         */
        request: function(onModuleLoaded, onModuleAborted) {
            var module = this;

            if (module.state.trySetRequested({
                path: module.getFullPath()
            })) {
                module.load();
            }

            module.queue.add(onModuleLoaded, onModuleAborted);
        },
        /**
         * @return {boolean}
         */
        findRecover: function() {
            var module = this,
                loader = module.loader,
                moduleName = module.name,
                nextRecover = module.nextRecover,
                foundRecover = nextRecover === false ? nextRecover : module.config.get('recover', nextRecover),
                recoverModuleName, parent;

            if (foundRecover) {
                recoverModuleName = foundRecover.restrict;

                // This is a recover on a higher level
                if (recoverModuleName !== moduleName) {
                    parent = loader.getModule(recoverModuleName).deps.parent;
                    // extract the next recovermodule
                    module.nextRecover = parent ? parent.name : false;

                    // Only recover this module
                    foundRecover.restrict = moduleName;
                }

                module.updateConfig(foundRecover);

                // Restore module recover association
                foundRecover.restrict = recoverModuleName;

                module.logger.warn(MSG_RECOVERING);

                module.load();
            }
            else {
                module.nextRecover = false;
            }

            return !!foundRecover;
        },
        /**
         * @param {(string|string[])} [dependencyOrArray]
         */
        abort: function(dependencyOrArray) {
            var module = this,
                state = module.state,
                isRegistered = state.isRegistered(),
                isDependenciesArray = System.isArray(dependencyOrArray),
                message;

            if (!module.isRoot() && ((state.isLoading() && !module.findRecover()) || isRegistered)) {
                message = isRegistered ? (isDependenciesArray ? MSG_MODULE_CIRCULAR_DEPENDENCIES_ABORTED : MSG_MODULE_DEPENDENCY_ABORTED) : MSG_MODULE_ABORTED;

                state.setAborted(message, isRegistered ? (isDependenciesArray ? {
                    deps: dependencyOrArray.join(SEPARATOR)
                } : {
                    dep: dependencyOrArray
                }) : {
                    path: SourceManager.removeSource(module.name),

                    sec: module.config.get('timeout')
                });

                module.queue.notifyError();
            }
        },

        setupAutoAbort: function() {
            var module = this;

            module.timeoutID = System.env.global.setTimeout(function abortModule() {
                module.abort();
            }, module.config.get('timeout') * 1000);
        },

        clearAutoAbort: function() {
            var module = this;

            module.timeoutID && System.env.global.clearTimeout(module.timeoutID);
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
                dependencies = module.deps,
                loader = module.loader,
                moduleName = module.name,
                parentRef;

            if (state.trySetRegistered()) {
                module.clearAutoAbort();

                if(!module.isRoot() && module.config.get('checkCircularDeps') && dependencies.hasCircular()) {
                    module.abort(dependencies.getCircular());
                }
                else {
                    dependencies.request(function onDependenciesLoaded(dependencyRefs) {
                        if (state.isRegistered() && !state.isLoaded()) {
                            if(module.isRoot()) {
                                module.ref = {};
                            }
                            else {
                                parentRef = dependencyRefs.shift();

                                loader.setCurrentModuleName(moduleName);

                                module.ref = parentRef[Resolver.getModuleTail(moduleName)] = factory ? factory.apply(parentRef, dependencyRefs) || {} : {};

                                loader.setCurrentModuleName(Resolver.getRootName());
                            }

                            state.setLoaded();
                            module.queue.notify();
                        }
                    });
                }
            }
        },
        /**
         * @param {JARS.internals.ModuleBundle.Declaration} bundleModules
         */
        defineBundle: function(bundleModules) {
            this.bundle.add(bundleModules);
        }
    };

    return Module;
});
