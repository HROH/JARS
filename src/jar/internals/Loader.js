JAR.internal('Loader', function loaderSetup(InternalsManager) {
    var utils = InternalsManager.get('utils'),
        objectEach = utils.objectEach,
        arrayEach = utils.arrayEach,
        Resolver = InternalsManager.get('Resolver'),
        Module = InternalsManager.get('Module'),
        InterceptionManager = InternalsManager.get('InterceptionManager'),
        Loader;

    /**
     * @access private
     *
     * @namespace Loader
     *
     * @memberof JAR
     * @inner
     */
    Loader = {
        context: 'default',

        modules: {},

        currentModuleName: Resolver.getRootName(),
        /**
         * @access public
         *
         * @alias JAR~Loader
         *
         * @memberof JAR~Loader#
         */
        constructor: Loader,
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} loaderContext
         *
         * @return {Boolean}
         */
        flush: function(loaderContext) {
            var loader = this;

            // TODO remove refs in modules with given loaderContext
            loader.eachModules(function(module) {
                //module.abort(true);
            });

            loader.getLogger().info('Successfully flushed Loader with context "${0}"', [loaderContext]);

            return flushSuccessful;
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {Object} newConfig
         */
        setModuleConfig: function(newConfig) {
            var loader = this,
                System = loader.getSystem(),
                modules;

            if (System.isArray(newConfig)) {
                arrayEach(newConfig, function setModuleConfig(config) {
                    loader.setModuleConfig(config);
                });
            }
            else {
                modules = newConfig.restrict ? Resolver.resolve(newConfig.restrict) : [Resolver.getRootName()];

                arrayEach(modules, function updateModuleConfig(moduleName) {
                    loader.getModule(moduleName).updateConfig(newConfig, Resolver.isBundle(moduleName));
                });
            }

            return loader.getRoot().bundleConfig;
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} moduleName
         */
        setCurrentModuleName: function(moduleName) {
            this.currentModuleName = moduleName;
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @return {Object}
         */
        getCurrentModuleData: function() {
            var loader = this,
                moduleName = loader.currentModuleName,
                module = loader.getModule(moduleName);

            return {
                moduleName: moduleName,

                path: module.getFullPath()
            };
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @return {Object}
         */
        getRoot: function() {
            return this.getModuleRef(Resolver.getRootName());
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @return {Object}
         */
        getSystem: function() {
            return this.getModuleRef('System');
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @return {Object}
         */
        getLogger: function() {
            return this.getModuleRef('System.Logger');
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} moduleName
         *
         * @return {*}
         */
        getModuleRef: function(moduleName) {
            return Loader.getModule(moduleName).ref;
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} moduleName
         *
         * @return {JAR~Module}
         */
        getModule: function(moduleName) {
            if (Resolver.isBundle(moduleName)) {
                moduleName = Resolver.extractModuleNameFromBundle(moduleName);
            }
            else {
                moduleName = InterceptionManager.removeInterceptionData(moduleName);
            }

            return Loader.modules[moduleName] || Loader.createModule(moduleName);
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} moduleName
         *
         * @return {JAR~Module}
         */
        createModule: function(moduleName) {
            return (Loader.modules[moduleName] = new Module(Loader, moduleName));
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {Function(JAR~Module)} callback
         */
        eachModules: function(callback) {
            objectEach(Loader.modules, callback);
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} moduleName
         * @param {Array} bundle
         *
         * @return {ModuleWrapper}
         */
        registerModule: function(moduleName, bundle) {
            var module;

            if(moduleName) {
                module = Loader.getModule(moduleName);

                bundle && module.defineBundle(bundle);
            }
            else {
                Loader.getLogger().error('No modulename provided');
            }

            return module;
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {String} listeningModuleName
         * @param {Array<string>} dependencies
         * @param {JAR~Module~successCallback} callback
         * @param {JAR~Module~failCallback} errback
         */
        subscribe: function(listeningModuleName, dependencies, callback, errback) {
            arrayEach(dependencies, function subscribe(dependency) {
                var isBundle = Resolver.isBundle(dependency);

                Loader.getModule(dependency).request(isBundle).onLoad(InterceptionManager.intercept(Loader, listeningModuleName, dependency, callback, errback), errback, isBundle);
            });
        },
        /**
         * @access public
         *
         * @memberof JAR~Loader#
         *
         * @param {(Object|Array|String)} moduleNames
         * @param {Function(...*)} callback
         * @param {JAR~Module~failCallback} errback
         * @param {Function(string)} progressback
         */
        $import: function(moduleNames, callback, errback, progressback) {
            var moduleName = Loader.currentModuleName,
                System = Loader.getSystem(),
                refs = [],
                refsIndexLookUp = {},
                ref, counter, moduleCount;

            moduleNames = Resolver.resolve(moduleNames, moduleName);
            counter = moduleCount = moduleNames.length;

            arrayEach(moduleNames, function addToLookUp(moduleName, moduleIndex) {
                refsIndexLookUp[moduleName] = moduleIndex;
            });

            System.isFunction(progressback) || (progressback = false);

            Loader.subscribe(moduleName, moduleNames, function publishLazy(publishingModuleName, data) {
                ref = System.isNil(data) ? Loader.getModuleRef(publishingModuleName) : data;
                refs[refsIndexLookUp[publishingModuleName]] = ref;

                counter--;

                progressback && progressback(ref, Number((1 - counter / moduleCount).toFixed(2)));

                counter || callback.apply(null, refs);
            }, errback);
        }
    };

    return Loader;
});
