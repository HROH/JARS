JARS.internal('Module', function moduleSetup(InternalsManager) {
    'use strict';

    var SourceManager = InternalsManager.get('SourceManager'),
        Resolver = InternalsManager.get('Resolver'),
        LoaderQueue = InternalsManager.get('LoaderQueue'),
        ModuleQueue = InternalsManager.get('ModuleQueue'),
        ModuleDependencies = InternalsManager.get('ModuleDependencies'),
        ModuleBundle = InternalsManager.get('ModuleBundle'),
        ModuleConfig = InternalsManager.get('ModuleConfig'),
        ModuleLogger = InternalsManager.get('ModuleLogger'),
        ModuleState = InternalsManager.get('ModuleState');

    /**
     * @callback SuccessCallback
     *
     * @memberof JARS~Module
     * @inner
     *
     * @param {String} moduleName
     * @param {*} [data]
     */

    /**
     * @callback FailCallback
     *
     * @memberof JARS~Module
     * @inner
     *
     * @param {String} moduleName
     */

    /**
     * @callback FactoryCallback
     *
     * @memberof JARS~Module
     * @inner
     *
     * @param {...*} dependencyRefs
     *
     * @return {*} moduleRef
     */

    /**
     * @typeDef {(String|JARS~Module~DependencyDefinition[]|Object<String, JARS~Module~DependencyDefinition>)} DependencyDefinition
     *
     * @memberof JARS~Module
     * @inner
     */

    /**
     * @typeDef {String[]} BundleDefinition
     *
     * @memberof JARS~Module
     * @inner
     */

    /**
     * @access public
     *
     * @constructor Module
     *
     * @memberof JARS
     * @inner
     *
     * @param {JARS~Loader} loader
     * @param {String} moduleName
     */
    function Module(loader, moduleName) {
        var module = this;

        module.name = moduleName;
        module.loader = loader;

        module.deps = new ModuleDependencies(module);
        module.bundle = new ModuleBundle(module);

        module.queue = new ModuleQueue(module);

        module.logger = new ModuleLogger(module);
        module.state = new ModuleState(module);

        module.interceptorData = {};
        module.interceptorDeps = [];

        module.initConfig();
    }

    Module.prototype = {
        /**
         * @access public
         *
         * @alias JARS~Module
         *
         * @memberof JARS~Module#
         */
        constructor: Module,
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @return {Boolean}
         */
        isRoot: function() {
            return Resolver.isRootName(this.name);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        initConfig: function() {
            var module = this;

            if(module.isRoot()) {
                module.config = module.bundleConfig = new ModuleConfig(module, true);
            }
            else {
                module.bundleConfig = new ModuleConfig(module, true, module.deps.getParent().bundleConfig);
                module.config = new ModuleConfig(module, false, module.bundleConfig);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {String} [fileType]
         *
         * @return {String}
         */
        getFullPath: function(fileType) {
            var module = this,
                config = module.config,
                cache = config.get('cache') ? '' : '?_=' + new Date().getTime(),
                path = config.get('basePath') + config.get('dirPath') + config.get('versionDir'),
                fileName = config.get('fileName') + config.get('minified') + '.' + (fileType || 'js') + cache;

            return path + fileName;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Object} newConfig
         * @param {Boolean} [updateBundleConfig]
         */
        updateConfig: function(newConfig, updateBundleConfig) {
            this[updateBundleConfig ? 'bundleConfig' : 'config'].update(newConfig);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {String[]} moduleNames
         * @param {Boolean} [asBundle]
         */
        subscribe: function(moduleNames, asBundle) {
            var module = this,
                state = module.state,
                loader = module.loader,
                System = loader.getSystem();

            new LoaderQueue(module, asBundle, function onModulesLoaded() {
                if(asBundle && module.state.isBundleRequested()) {
                    module.bundle.subscribe();
                }
                else if ((asBundle || state.isRegistered()) && !state.isLoaded(asBundle)) {
                    asBundle || module.init();

                    state.setLoaded(asBundle);
                    module.queue.notify(asBundle);
                }
            }, function onModuleLoaded(publishingModuleName, data) {
                if (!System.isNil(data)) {
                    module.interceptorData[publishingModuleName] = data;
                }
            }).loadModules(moduleNames);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Boolean} requestBundle
         *
         * @return {JARS~Module}
         */
        request: function(requestBundle) {
            var module = this;

            if (module.state.trySetRequested(requestBundle)) {
                if(requestBundle) {
                    module.subscribe([module.name], requestBundle);
                }
                else {
                    module.setupAutoAbort();

                    SourceManager.loadSource(module.name, module.getFullPath());
                }
            }

            return module;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~SuccessCallback} callback
         * @param {JARS~Module~FailCallback} errback
         * @param {Boolean} loadBundle
         */
        onLoad: function(callback, errback, loadBundle) {
            var module = this;

            if (!module.state.isLoaded(loadBundle)) {
                module.queue.add(callback, errback, loadBundle);
            }
            else {
                callback(module.getName(loadBundle));
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @return {Boolean}
         */
        findRecover: function() {
            var module = this,
                loader = module.loader,
                moduleName = module.name,
                nextRecover = module.nextRecover,
                foundRecover = nextRecover === false ? nextRecover : module.config.get('recover', nextRecover),
                recoverModuleName;

            if (foundRecover) {
                recoverModuleName = foundRecover.restrict;

                // This is a recover on a higher level
                if (recoverModuleName !== moduleName) {
                    // extract the next recovermodule
                    module.nextRecover = Resolver.isRootName(recoverModuleName) ? false : loader.getModule(recoverModuleName).deps.getParentName();

                    // Only recover this module
                    foundRecover.restrict = moduleName;
                }

                module.updateConfig(foundRecover);

                // Restore module recover association
                foundRecover.restrict = recoverModuleName;

                module.state.logRecovering();

                module.request();
            }
            else {
                module.nextRecover = false;
            }

            return !!foundRecover;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Boolean} [abortBundle]
         * @param {String} [dependency]
         */
        abort: function(abortBundle, dependency) {
            var module = this,
                abortionInfo = {
                    dep: dependency,

                    path: SourceManager.removeSource(module.name),

                    sec: module.config.get('timeout')
                };

            if (module.state.trySetAborted(abortBundle, abortionInfo)) {
                module.queue.notifyError(abortBundle);
            }
        },

        setupAutoAbort: function() {
            var module = this;

            module.timeoutID = module.loader.getSystem().env.global.setTimeout(function abortModule() {
                module.abort();
            }, module.config.get('timeout') * 1000);
        },

        clearAutoAbort: function() {
            var module = this;

            module.timeoutID && module.loader.getSystem().env.global.clearTimeout(module.timeoutID);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Boolean} forBundle
         *
         * @return {String}
         */
        getName: function(forBundle) {
            var moduleName = this.name;

            return forBundle ? Resolver.getBundleName(moduleName) : moduleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~DependencyDefinition} dependencies
         */
        $import: function(dependencies) {
            var module = this;

            if (!module.state.isRegistered()) {
                module.deps.add(dependencies);
            }

            return module;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~FactoryCallback} factory
         */
        $export: function(factory) {
            var module = this,
                state = module.state,
                dependencies = module.deps;

            if (state.trySetRegistered()) {
                module.factory = factory || Object;

                module.clearAutoAbort();

                if(!module.isRoot() && dependencies.hasCircular()) {
                    module.abort();
                }
                else {
                    dependencies.request();
                }
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~BundleDefinition} bundleModules
         */
        defineBundle: function(bundleModules) {
            this.bundle.add(bundleModules);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        init: function() {
            var module = this,
                loader = module.loader,
                moduleName = module.name,
                factory = module.factory,
                rootName = Resolver.getRootName(),
                dependencies = module.deps,
                parentRef;

            if(module.isRoot()) {
                module.ref = {};
            }
            else {
                parentRef = dependencies.getParentRef();

                loader.setCurrentModuleName(moduleName);

                module.ref = parentRef[Resolver.getPathOptions(moduleName).fileName] = factory.apply(parentRef, dependencies.getRefs()) || {};

                loader.setCurrentModuleName(rootName);
            }
        }
    };

    return Module;
});
