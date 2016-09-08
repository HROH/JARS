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
        MSG_RECOVERING = 'failed to load and tries to recover...';

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
                fileName = config.get('fileName') + config.get('minified') + (fileType || config.get('extension')) + cache;

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
         * @return {JARS~Module}
         */
        load: function() {
            var module = this;

            module.setupAutoAbort();

            SourceManager.loadSource(module.name, module.getFullPath());
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~SuccessCallback} callback
         * @param {JARS~Module~FailCallback} errback
         */
        request: function(callback, errback) {
            var module = this;

            if (module.state.trySetRequested()) {
                module.load();
            }

            module.queue.add(callback, errback);
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

                module.logger.warn(MSG_RECOVERING);

                module.load();
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
         * @param {String} [dependency]
         */
        abort: function(dependency) {
            var module = this,
                abortionInfo = {
                    dep: dependency,

                    path: SourceManager.removeSource(module.name),

                    sec: module.config.get('timeout')
                };

            if (module.state.trySetAborted(false, abortionInfo)) {
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
                dependencies = module.deps,
                loader = module.loader,
                moduleName = module.name,
                parentRef;

            if (state.trySetRegistered()) {
                module.clearAutoAbort();

                if(!module.isRoot() && dependencies.hasCircular()) {
                    module.abort();
                }
                else {
                    dependencies.request(function(refs) {
                        if (state.isRegistered() && !state.isLoaded()) {
                            if(module.isRoot()) {
                                module.ref = {};
                            }
                            else {
                                parentRef = refs.shift();

                                loader.setCurrentModuleName(moduleName);

                                module.ref = parentRef[Resolver.getModuleTail(moduleName)] = factory ? factory.apply(parentRef, refs) || {} : {};

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
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~BundleDefinition} bundleModules
         */
        defineBundle: function(bundleModules) {
            this.bundle.add(bundleModules);
        }
    };

    return Module;
});
