JARS.internal('Module', function moduleSetup(InternalsManager) {
    var QUEUE_SUCCESS = 0,
        QUEUE_ERROR = 1,
        arrayEach = InternalsManager.get('utils').arrayEach,
        SourceManager = InternalsManager.get('SourceManager'),
        Resolver = InternalsManager.get('Resolver'),
        CircularDepsChecker = InternalsManager.get('CircularDepsChecker'),
        Config = InternalsManager.get('Config'),
        ModuleState = InternalsManager.get('ModuleState');

    /**
     * @callback successCallback
     *
     * @memberof JARS~Module
     * @inner
     *
     * @param {String} moduleName
     * @param {*} data
     */

    /**
     * @callback failCallback
     *
     * @memberof JARS~Module
     * @inner
     *
     * @param {String} moduleName
     */

    /**
     * @callback factoryCallback
     *
     * @memberof JARS~Module
     * @inner
     *
     * @param {...*} dependencyRefs
     *
     * @param {*} moduleRef
     */

    /**
     * @access private
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

        module.dep = Resolver.getImplicitDependencyName(moduleName);
        module.deps = [];
        module.bundle = [];

        module.depsQueue = [];
        module.bundleQueue = [];

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
         * @type {Number}
         * @default
         *
         * @memberof JARS~Module#
         */
        depsCounter: 0,
        /**
         * @access public
         *
         * @type {Number}
         * @default
         *
         * @memberof JARS~Module#
         */
        bundleCounter: 0,
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        initConfig: function() {
            var module = this;

            if(Resolver.isRootName(module.name)) {
                module.config = module.bundleConfig = new Config(module, true);
            }
            else {
                module.bundleConfig = new Config(module, true, module.loader.getModule(module.dep || Resolver.getRootName()).bundleConfig);
                module.config = new Config(module, false, module.bundleConfig);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @return {Array}
         */
        getAllDeps: function() {
            var module = this,
                implicitDependency = module.dep,
                dependencies = module.deps.concat(module.interceptorDeps);

            implicitDependency && dependencies.unshift(implicitDependency);

            return dependencies;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {String} fileType
         *
         * @return {String}
         */
        getFileName: function(fileType) {
            var module = this,
                cache = module.config.get('cache') ? '' : '?_=' + new Date().getTime();

            return [module.config.get('fileName'), module.config.get('minified'), '.', fileType, cache].join('');
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @return {String}
         */
        getPath: function() {
            var module = this;

            return [module.config.get('basePath'), module.config.get('dirPath'), module.config.get('versionDir')].join('');
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
            return this.getPath() + this.getFileName(fileType || 'js');
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
         */
        depsLoaded: function() {
            var module = this,
                state = module.state;

            if (state.isRegistered() && !state.isLoaded()) {
                module.init();

                state.setLoaded();
                module.notify();
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        bundleLoaded: function() {
            var module = this,
                state = module.state;

            if (!state.isLoaded(true)) {
                state.setLoaded(true);
                module.notify(true);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Array<string>} moduleNames
         * @param {Boolean} [asBundle]
         */
        subscribe: function(moduleNames, asBundle) {
            var module = this,
                state = module.state,
                loader = module.loader,
                moduleCount = moduleNames.length,
                System = loader.getSystem();

            if (!module.setLoadedIfReady(moduleCount, asBundle) && moduleCount) {
                state.logSubscription(moduleNames, asBundle);

                loader.subscribe(module.getName(asBundle), moduleNames, function onModuleLoaded(publishingModuleName, data) {
                    state.logNotification(publishingModuleName, asBundle);

                    if (!System.isNil(data)) {
                        module.interceptorData[publishingModuleName] = data;
                    }

                    asBundle && state.isBundleRequested() && module.subscribeToBundle();

                    module.setLoadedIfReady(-1, asBundle);
                }, function onModuleAborted(dependency) {
                    module.abort(asBundle, dependency);
                });
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Number} count
         * @param {Boolean} forBundle
         *
         * @return {Boolean}
         */
        setLoadedIfReady: function(count, forBundle) {
            var module = this,
                moduleDepsBundlePrefix = forBundle ? 'bundle' : 'deps',
                depsBundleCounter = moduleDepsBundlePrefix + 'Counter',
                isReady;

            module[depsBundleCounter] += count;
            isReady = !module[depsBundleCounter];

            if (isReady) {
                module[moduleDepsBundlePrefix + 'Loaded']();
            }

            return isReady;
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
            var module = this,
                state = module.state,
                isWaiting = state.isWaiting(requestBundle);

            state.logRequested(requestBundle);

            if (isWaiting) {
                module['load' + (requestBundle ? 'Bundle' : '')]();
            }
            else {
                state.logRequestProgress(requestBundle);
            }

            return module;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        loadBundle: function() {
            var module = this;

            module.state.setBundleRequested();

            module.subscribe([module.name], true);
        },

        subscribeToBundle: function() {
            var module = this,
                state = module.state,
                bundle = module.bundle;

            if (bundle.length) {
                state.logBundleFound(bundle);

                state.setLoading(true);

                module.subscribe(bundle, true);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~successCallback} callback
         * @param {JARS~Module~failCallback} errback
         * @param {Boolean} loadBundle
         */
        onLoad: function(callback, errback, loadBundle) {
            var module = this;

            if (!module.state.isLoaded(loadBundle)) {
                module.enqueue(callback, errback, loadBundle);
            }
            else {
                callback(module.getName(loadBundle));
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        load: function() {
            var module = this;

            module.state.setLoading();

            module.timeoutID = module.loader.getSystem().env.global.setTimeout(function abortModule() {
                module.abort();
            }, module.config.get('timeout'));

            SourceManager.loadSource(module.name, module.getFullPath());
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
                    module.nextRecover = Resolver.isRootName(recoverModuleName) ? false : loader.getModule(recoverModuleName).dep || Resolver.getRootName();

                    // Only recover this module
                    foundRecover.restrict = moduleName;
                }

                module.updateConfig(foundRecover);

                // Restore module recover association
                foundRecover.restrict = recoverModuleName;

                module.state.logRecovering();

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
         * @param {Boolean} [abortBundle]
         * @param {String} [dependency]
         */
        abort: function(abortBundle, dependency) {
            var module = this,
                state = module.state,
                emptyQueue = false;

            if (abortBundle) {
                if (state.isLoading(abortBundle)) {
                    state.setWaiting(abortBundle);
                    state.logAbortion(abortBundle);
                    emptyQueue = true;
                }
            }
            else if (state.isLoading()) {
                state.setWaiting();

                if (!module.findRecover()) {
                    emptyQueue = true;

                    state.logAbortion(abortBundle, {
                        path: SourceManager.removeSource(module.name),

                        sec: module.config.get('timeout')
                    });
                }
            }
            else if (state.isRegistered()) {
                dependency && state.logAbortionOfDep(dependency);
                emptyQueue = true;
            }

            if (emptyQueue) {
                module.dequeue(QUEUE_ERROR, abortBundle);
            }
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
         * @param {Boolean} forBundle
         *
         * @return {Array}
         */
        getQueue: function(forBundle) {
            return this[(forBundle ? 'bundle' : 'deps') + 'Queue'];
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~successCallback} callback
         * @param {JARS~Module~failCallback} errback
         * @param {Boolean} enqueueBundle
         */
        enqueue: function(callback, errback, enqueueBundle) {
            this.getQueue(enqueueBundle).push([callback, errback]);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Number} queueType
         * @param {Boolean} dequeueBundle
         */
        dequeue: function(queueType, dequeueBundle) {
            var module = this,
                name = module.getName(dequeueBundle),
                queue = module.getQueue(dequeueBundle),
                System = module.loader.getSystem(),
                callback;

            while (queue.length) {
                callback = queue.shift()[queueType];

                if (System.isFunction(callback)) {
                    callback(name);
                }
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {(Object|Array|String)} dependencies
         */
        $import: function(dependencies) {
            var module = this;

            if (!module.state.isRegistered()) {
                module.deps = module.deps.concat(Resolver.resolve(dependencies, module.name));
            }

            return module;
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {JARS~Module~factoryCallback} factory
         */
        $export: function(factory) {
            var module = this,
                state = module.state;

            if (!state.isRegistered()) {
                module.factory = factory || Object;

                if (state.isLoading()) {
                    module.loader.getSystem().env.global.clearTimeout(module.timeoutID);
                    state.setRegistered();
                }
                else {
                    state.setLoadedManual();
                }

                if(!Resolver.isRootName(module.name) && CircularDepsChecker.hasCircularDeps(module)) {
                    state.logCircularDepsFound(CircularDepsChecker.getCircularDeps(module));

                    module.abort();
                }
                else {
                    module.requestDeps();
                }
            }
            else {
                state.logAlreadyRegistered();
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Array} bundle
         */
        defineBundle: function(bundle) {
            var module = this,
                state = module.state;

            if (state.isWaiting(true) || state.isBundleRequested()) {
                module.bundle = Resolver.resolveBundle(bundle, module.name);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         */
        requestDeps: function() {
            var module = this,
                state = module.state,
                implicitDependency = module.dep,
                dependencies = module.deps;

            if (dependencies.length) {
                state.logDepsFound(dependencies);
            }

            if (implicitDependency) {
                state.logDepFound(implicitDependency);

                dependencies = module.getAllDeps();
            }


            module.subscribe(dependencies);
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @param {Boolean} [notifyBundle]
         */
        notify: function(notifyBundle) {
            this.dequeue(QUEUE_SUCCESS, notifyBundle);
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
                dep = module.dep || rootName,
                parentRef;

            if(Resolver.isRootName(moduleName)) {
                module.ref = {};
            }
            else {
                parentRef = loader.getModuleRef(dep);

                loader.setCurrentModuleName(moduleName);

                module.ref = parentRef[Resolver.getPathOptions(moduleName).fileName] = factory.apply(parentRef, module.getDepRefs()) || {};

                loader.setCurrentModuleName(rootName);
            }
        },
        /**
         * @access public
         *
         * @memberof JARS~Module#
         *
         * @return {Array}
         */
        getDepRefs: function() {
            var module = this,
                loader = module.loader,
                dependencies = module.deps,
                depRefs = [],
                System = loader.getSystem(),
                data;

            arrayEach(dependencies, function getDepRef(dependencyName) {
                data = module.interceptorData[dependencyName];
                depRefs.push(System.isNil(data) ? loader.getModuleRef(dependencyName) : data);
            });

            return depRefs;
        }
    };

    return Module;
});
