JARS.internal('Loader', function loaderSetup(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        objectEach = utils.objectEach,
        arrayEach = utils.arrayEach,
        Resolver = InternalsManager.get('Resolver'),
        Module = InternalsManager.get('Module'),
        InterceptionManager = InternalsManager.get('InterceptionManager'),
        modulesRegistry = {},
        currentModuleName = Resolver.getRootName(),
        currentLoaderContext = 'default',
        Loader;

    /**
     * @access public
     *
     * @namespace Loader
     *
     * @memberof JARS
     * @inner
     */
    Loader = {
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @param {String} loaderContext
         *
         * @return {Boolean}
         */
        flush: function(loaderContext) {
            var flushSuccessful = false;

            // TODO remove refs in modules with given loaderContext
            Loader.eachModules(function(module) {
                flushSuccessful = module.flush(loaderContext);

                return !flushSuccessful;
            });

            Loader.getLogger().info('Successfully flushed Loader with context "${0}"', [loaderContext]);

            return flushSuccessful;
        },

        setLoaderContext: function(newLoaderContext) {
            currentLoaderContext = newLoaderContext;
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @param {Object} newConfig
         */
        setModuleConfig: function(newConfig) {
            var System = Loader.getSystem(),
                modules;

            if (System.isArray(newConfig)) {
                arrayEach(newConfig, function setModuleConfig(config) {
                    Loader.setModuleConfig(config);
                });
            }
            else {
                modules = newConfig.restrict ? Resolver.resolve(newConfig.restrict) : [Resolver.getRootName()];

                arrayEach(modules, function updateModuleConfig(moduleName) {
                    Loader.getModule(moduleName).updateConfig(newConfig, Resolver.isBundle(moduleName));
                });
            }

            return Loader.getRoot().bundleConfig;
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @param {String} moduleName
         */
        setCurrentModuleName: function(moduleName) {
            currentModuleName = moduleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @return {Object}
         */
        getCurrentModuleData: function() {
            var moduleName = currentModuleName,
                module = Loader.getModule(moduleName);

            return {
                moduleName: moduleName,

                path: module.getFullPath()
            };
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @return {Object}
         */
        getRoot: function() {
            return Loader.getModuleRef(Resolver.getRootName());
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @return {System}
         */
        getSystem: function() {
            return Loader.getModuleRef('System');
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @return {System.Logger}
         */
        getLogger: function() {
            return Loader.getModuleRef('System.Logger');
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
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
         * @memberof JARS~Loader
         *
         * @param {String} moduleName
         *
         * @return {JARS~Module}
         */
        getModule: function(moduleName) {
            if (Resolver.isBundle(moduleName)) {
                moduleName = Resolver.extractModuleNameFromBundle(moduleName);
            }
            else {
                moduleName = InterceptionManager.removeInterceptionData(moduleName);
            }

            return modulesRegistry[moduleName] || Loader.createModule(moduleName);
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @param {String} moduleName
         *
         * @return {JARS~Module}
         */
        createModule: function(moduleName) {
            return (modulesRegistry[moduleName] = new Module(Loader, moduleName));
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @param {Function(JARS~Module)} callback
         */
        eachModules: function(callback) {
            objectEach(modulesRegistry, callback);
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
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

                module.defineBundle(bundle);
            }
            else {
                Loader.getLogger().error('No modulename provided');
            }

            return module;
        },
        /**
         * @access public
         *
         * @memberof JARS~Loader
         *
         * @param {String} listeningModuleName
         * @param {String[]} dependencies
         * @param {JARS~Module~SuccessCallback} callback
         * @param {JARS~Module~FailCallback} errback
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
         * @memberof JARS~Loader
         *
         * @param {JARS~Module~DependencyDefinition} moduleNames
         * @param {Function(...*)} callback
         * @param {JARS~Module~FailCallback} errback
         * @param {Function(string)} progressback
         */
        $import: function(moduleNames, callback, errback, progressback) {
            var moduleName = currentModuleName,
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
