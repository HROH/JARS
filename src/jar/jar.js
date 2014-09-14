(function globalSetup(global, undef) {
    'use strict';

    var SourceManager, LoaderManager, ConfigurationManager, hasOwnProp;

    /**
     * @access private
     * 
     * @memberof JAR
     * @inner
     * 
     * @param {Object} object
     * @param {String} prop
     * 
     * @return {Boolean}
     */
    hasOwnProp = (function hasOwnPropSetup() {
        var hasOwn = ({}).hasOwnProperty;

        return function hasOwnProp(object, prop) {
            return hasOwn.call(object, prop);
        };
    })();

    ConfigurationManager = (function configurationManagerSetup() {
        var MIN_TIMEOUT = 0.5,
            STRING_CHECK = 'String',
            OBJECT_CHECK = 'Object',
            BOOLEAN_CHECK = 'Boolean',
            loaderConfig = {
                checkCircularDeps: false,

                createDependencyURLList: false
            },
            modulesConfig = {},
            ConfigurationManager, definitions;

        definitions = {
            baseUrl: {
                check: STRING_CHECK,

                transform: function baseUrlTransform(baseUrl) {
                    return LoaderManager.Resolver.ensureEndsWithSlash(baseUrl);
                }
            },

            cache: {
                check: BOOLEAN_CHECK,
                /**
                 * @param {Boolean} cache
                 * 
                 * @return {Boolean}
                 */
                transform: function cacheTransform(cache) {
                    return !!cache;
                }
            },

            config: {
                check: OBJECT_CHECK,
                /**
                 * @param {Object} config
                 * @param {String} moduleName
                 * 
                 * @return {Object}
                 */
                transform: function configTransform(config, moduleName) {
                    var oldConfig = modulesConfig[moduleName].config || {},
                        option;

                    for (option in config) {
                        if (hasOwnProp(config, option)) {
                            oldConfig[option] = config[option];
                        }
                    }

                    return oldConfig;
                }
            },

            dirPath: {
                check: STRING_CHECK,

                transform: function dirPathTransform(baseUrl) {
                    return LoaderManager.Resolver.ensureEndsWithSlash(baseUrl);
                }
            },

            fileName: {
                check: STRING_CHECK
            },

            fileType: {
                check: STRING_CHECK
            },

            minified: {
                check: BOOLEAN_CHECK,
                /**
                 * @param {Boolean} loadMin
                 * 
                 * @return {String}
                 */
                transform: function minTransform(loadMin) {
                    return loadMin ? '.min' : '';
                }
            },

            recover: {
                check: OBJECT_CHECK,
                /**
                 * @param {Object} recoverConfig
                 * @param {String} moduleName
                 * 
                 * @return {Object}
                 */
                transform: function recoverTransform(recoverConfig, moduleName) {
                    var recover = {},
                        option;

                    // create a copy of the recover-config
                    // because it should update for every module independendly
                    for (option in recoverConfig) {
                        if (hasOwnProp(recoverConfig, option)) {
                            (recover[option] = recoverConfig[option]);
                        }
                    }

                    recover.restrict = moduleName;
                    // if no next recover-config is given set it explicitly
                    // this is important because the recoverflow is as follows:
                    // - if the module has a recover-config, use it to update its config
                    // - if it has no recover-config look for it in a higher bundle-config
                    // - if such a config is found, update the config for the module
                    // - when the module-config is updated, options will always be overwritten but never deleted
                    // So if the module has a recover-config that doesn't get replaced
                    // it may repeatedly try to recover with this config
                    recover.recover || (recover.recover = null);

                    return recover;
                }
            },

            timeout: {
                check: 'Number',
                /**
                 * @param {Number} timeout
                 * 
                 * @return {Number}
                 */
                transform: function timeoutTransform(timeout) {
                    return timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT;
                }
            },

            versionSuffix: {
                check: STRING_CHECK
            }
        };

        /**
         * @access private
         * 
         * @memberof JAR~ConfigurationManager
         * @inner
         * 
         * @param {String} moduleName
         * @param {String} option
         * @param {*} value
         */
        function configurationManagerTransformModuleConfig(moduleName, option, value) {
            var transform = definitions[option].transform;

            return transform ? transform(value, moduleName) : value;
        }

        /**
         * @access private
         * 
         * @memberof JAR~ConfigurationManager
         * @inner
         * 
         * @param {String} moduleName
         * @param {Object} newConfig
         */
        function configurationManagerUpdateModuleConfig(moduleName, newConfig) {
            var System = LoaderManager.getSystem(),
                config = modulesConfig[moduleName] = modulesConfig[moduleName] || {},
                definition, option, value;

            for (option in newConfig) {
                if (hasOwnProp(newConfig, option) && hasOwnProp(definitions, option)) {
                    definition = definitions[option];
                    value = newConfig[option];

                    if (System['is' + definition.check](value)) {
                        config[option] = configurationManagerTransformModuleConfig(moduleName, option, value);
                    }
                    else if (System.isFunction(value)) {
                        config[option] = value;
                    }
                    else if (System.isNull(value)) {
                        delete config[option];
                    }
                }
            }
        }

        /**
         * @access private
         * 
         * @namespace ConfigurationManager
         * 
         * @memberof JAR
         * @inner
         */
        ConfigurationManager = {
            /**
             * @access public
             * 
             * @memberof JAR~ConfigurationManager
             * 
             * @param {(Object|Array)} newConfig
             * 
             * @return {Object}
             */
            setModuleConfig: function(newConfig) {
                var System = LoaderManager.getSystem(),
                    index = 0,
                    length, modules;

                if (System.isArray(newConfig)) {
                    length = newConfig.length;

                    for (; index < length; index++) {
                        ConfigurationManager.setModuleConfig(newConfig[index]);
                    }
                }
                else if (System.isObject(newConfig)) {
                    modules = newConfig.restrict ? LoaderManager.Resolver.resolve(newConfig.restrict) : [LoaderManager.Resolver.getRootName()];
                    length = modules.length;

                    for (; index < length; index++) {
                        configurationManagerUpdateModuleConfig(modules[index], newConfig);
                    }
                }

                return modulesConfig;
            },
            /**
             * @access public
             * 
             * @memberof JAR~ConfigurationManager
             * 
             * @param {String} moduleName
             * @param {String} option
             * @param {Boolean} skipUntil
             * 
             * @return {*}
             */
            getModuleConfig: function(moduleName, option, defaultValue, skipUntil) {
                var System = LoaderManager.getSystem(),
                    origModuleName = moduleName,
                    nextLevel = moduleName,
                    skip = false,
                    transformations = [],
                    result;

                do {
                    if (!skip && modulesConfig[moduleName]) {
                        result = modulesConfig[moduleName][option];

                        if (System.isFunction(result)) {
                            transformations.push(result);
                            result = undef;
                        }
                    }

                    if (nextLevel) {
                        moduleName = LoaderManager.Resolver.getBundleName(nextLevel);
                        nextLevel = LoaderManager.Resolver.getImplicitDependencyName(nextLevel);
                    }
                    else {
                        moduleName = !LoaderManager.Resolver.isRootName(moduleName) ? LoaderManager.Resolver.getRootName() : undef;
                    }

                    if (skipUntil) {
                        skip = skipUntil !== moduleName;
                        skip || (skipUntil = undef);
                    }

                } while (!System.isSet(result) && moduleName);

                System.isSet(result) || (result = defaultValue);

                while (transformations.length) {
                    result = configurationManagerTransformModuleConfig(origModuleName, option, transformations.pop()(result, origModuleName));
                }

                return result;
            },
            /**
             * @access public
             * 
             * @memberof JAR~ConfigurationManager
             * 
             * @param {String} option
             * @param {Object} value
             * 
             * @return {Object}
             */
            setLoaderConfig: function(config) {
                var option;

                for (option in config) {
                    if (hasOwnProp(config, option)) {
                        loaderConfig[option] = config[option];
                    }
                }

                return loaderConfig;
            },
            /**
             * @access public
             * 
             * @memberof JAR~ConfigurationManager
             * 
             * @param {String} option
             * 
             * @return {*}
             */
            getLoaderConfig: function(option) {
                return loaderConfig[option];
            }
        };

        return ConfigurationManager;
    })();

    /**
     * @access private
     * 
     * @namespace SourceManager
     * 
     * @memberof JAR
     * @inner
     */
    SourceManager = (function sourceManagerSetup() {
        var doc = global.document,
            head = doc.getElementsByTagName('head')[0],
            scripts = {},
            styleSheets = {},
            createStyleSheet;

        /**
         * @access private
         * 
         * @memberof JAR~SourceManager
         * @inner
         * 
         * @param {String} path
         * 
         * @return {HTMLLinkElement}
         */
        createStyleSheet = (doc.createStyleSheet ? function(path) {
            return doc.createStyleSheet(path).owningElement;
        } : function() {
            return doc.createElement('link');
        });

        return {
            /**
             * @access public
             * 
             * @memberof JAR~SourceManager
             * 
             * @return {HTMLCollection}
             */
            getScripts: function() {
                return doc.getElementsByTagName('script');
            },
            /**
             * @access public
             * 
             * @memberof JAR~SourceManager
             * 
             * @param {String} moduleName
             * @param {String} path
             */
            addScript: function(moduleName, path) {
                var script = doc.createElement('script');

                head.appendChild(script);

                script.id = moduleName;
                script.type = 'text/javascript';
                script.src = path;
                script.async = true;

                scripts[moduleName] = script;
            },
            /**
             * @access public
             * 
             * @memberof JAR~SourceManager
             * 
             * @param {String} moduleName
             * 
             * @return {Boolean}
             */
            findScript: function(moduleName) {
                var script = (doc.currentScript && doc.currentScript.id === moduleName) ? doc.currentScript : doc.getElementById(moduleName),
                    foundScript = !! script;

                if (foundScript) {
                    script.id += ':loaded';
                }

                return foundScript;
            },
            /**
             * @access public
             * 
             * @memberof JAR~SourceManager
             * 
             * @param {String} moduleName
             * 
             * @return {String} path
             */
            removeScript: function(moduleName) {
                var script = scripts[moduleName],
                    path = script.src;

                head.removeChild(script);

                delete scripts[moduleName];

                return path;
            },
            /**
             * @access public
             * 
             * @memberof JAR~SourceManager
             * 
             * @param {String} moduleName
             * @param {String} path
             */
            addStyleSheet: function(moduleName, path) {
                var styleSheet;

                path = path;
                styleSheet = createStyleSheet(path);

                head.insertBefore(styleSheet, head.firstChild);

                styleSheet.id = 'css:' + moduleName;
                styleSheet.setAttribute('type', 'text/css');
                styleSheet.setAttribute('rel', 'stylesheet');
                styleSheet.setAttribute('href', path);
                styleSheets[moduleName] = styleSheet;
            },
            /**
             * @access public
             * 
             * @memberof JAR~SourceManager
             * 
             * @param {String} moduleName
             * 
             * @return {String}
             */
            removeStyleSheet: function(moduleName) {
                var styleSheet = styleSheets[moduleName],
                    path = styleSheet.href;

                head.removeChild(styleSheet);
                delete styleSheets[moduleName];

                return path;
            }
        };
    })();

    LoaderManager = (function loaderManagerSetup() {
        var separator = '", "',
            loaders = {},
            loaderCoreModules = {},
            interceptors = {},
            Module, Resolver, LoaderManager;

        Module = (function moduleSetup() {
            var QUEUE_SUCCESS = 0,
                QUEUE_ERROR = 1,

                // Loader message indices
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_ABORTED = 0,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_ALREADY_LOADED = 1,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_ALREADY_LOADING = 2,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_FOUND = 3,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_LOADED = 4,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_LOADING = 5,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_NOT_DEFINED = 6,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_BUNDLE_REQUESTED = 7,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_CIRCULAR_DEPENDENCIES_FOUND = 8,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_DEPENDENCIES_FOUND = 9,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_DEPENDENCY_FOUND = 10,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_INTERCEPTION_ERROR = 11,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_ALREADY_LOADED = 12,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_ALREADY_LOADED_MANUAL = 13,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_ALREADY_LOADING = 14,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_ALREADY_REGISTERED = 15,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_LOADED = 16,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_LOADED_MANUAL = 17,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_LOADING = 18,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_RECOVERING = 19,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_REGISTERING = 20,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_REQUESTED = 21,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_SUBSCRIBED = 22,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_MODULE_PUBLISHED = 23,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MSG_TIMEOUT = 24,

                // Module states
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_WAITING = 1,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_LOADING = 2,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_LOADED = 3,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_REGISTERED = 4,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_LOADED_MANUAL = 5,

                // Bundle states
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_BUNDLE_WAITING = 0,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_BUNDLE_LOADING = 1,
                /**
                 * @access private
                 * 
                 * @const {Number}
                 * 
                 * @memberof JAR~LoaderManager
                 * @inner
                 */
                MODULE_BUNDLE_LOADED = 2;

            /**
             * @access private
             * 
             * @constructor Module
             * 
             * @memberof JAR~LoaderManager
             * @inner
             * 
             * @param {JAR~LoaderManager~Loader} loader
             * @param {String} moduleName
             */
            function Module(loader, moduleName) {
                var module = this;

                module.name = moduleName;
                module.loader = loader;
                module.bundleName = Resolver.getBundleName(moduleName);
                module.options = Resolver.getPathOptions(moduleName);
                module.options.fileType = 'js';

                module.dep = Resolver.getImplicitDependencyName(moduleName);
                module.deps = [];
                module.bundle = [];

                module.depsQueue = [];
                module.bundleQueue = [];

                module.state = MODULE_WAITING;
                module.bundleState = MODULE_BUNDLE_WAITING;

                module.interceptorData = {};
                module.interceptorDeps = [];
            }

            Module.prototype = {
                /**
                 * @access public
                 * 
                 * @alias JAR~LoaderManager~Module
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                constructor: Module,
                /**
                 * @access public
                 * 
                 * @type {Number}
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                depsCounter: 0,
                /**
                 * @access public
                 * 
                 * @type {Number}
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                bundleCounter: 0,
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Number} state
                 * 
                 * @return {Boolean}
                 */
                isState: function(state) {
                    return this.state === state;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Number} state
                 */
                setState: function(state) {
                    this.state = state;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Boolean} logState
                 * 
                 * @return {Boolean}
                 */
                isRegistered: function(logState) {
                    var module = this,
                        isRegistered = module.isState(MODULE_REGISTERED) || module.isState(MODULE_LOADED) || module.isState(MODULE_LOADED_MANUAL);

                    isRegistered && logState && module.log(MSG_MODULE_ALREADY_REGISTERED);

                    return isRegistered;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Boolean}
                 */
                isLoading: function() {
                    return this.isState(MODULE_LOADING);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Boolean}
                 */
                isLoaded: function() {
                    return this.isState(MODULE_LOADED);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Number} bundleState
                 * 
                 * @return {Boolean}
                 */
                isBundleState: function(bundleState) {
                    return this.bundleState === bundleState;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Number} bundleState
                 */
                setBundleState: function(bundleState) {
                    this.bundleState = bundleState;
                },
                /**
                 * @access public
                 * 
                 * @function
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Number} messageType
                 * @param {Boolean} logBundle
                 * @param {Object} values
                 */
                log: (function moduleLogMessageSetup() {
                    var messageTemplates = [],
                        messageTypes = {},
                        module = 'module',
                        bundle = 'bundle',
                        requested = '${what} requested',
                        startLoad = 'started loading ${what}',
                        endLoad = 'finished loading ${what}',
                        attemptedTo = 'attempted to ',
                        attemptLoad = attemptedTo + 'load ${what} but ${why}',
                        already = 'is already ',
                        alreadyLoading = already + 'loading',
                        alreadyLoaded = already + 'loaded',
                        attemptLoadModule = replaceModule(attemptLoad),
                        attemptLoadBundle = replaceBundle(attemptLoad),
                        abortedLoading = 'aborted loading ${what}',
                        loggerOptions;

                    /**
                     * @access private
                     * 
                     * @param {String} message
                     * @param {String} what
                     * 
                     * @return {String}
                     */
                    function replaceWhat(message, what) {
                        return message.replace('${what}', what);
                    }

                    /**
                     * @access private
                     * 
                     * @param {String} message
                     * 
                     * @return {String}
                     */
                    function replaceModule(message) {
                        return replaceWhat(message, module);
                    }

                    /**
                     * @access private
                     * 
                     * @param {String} message
                     * 
                     * @return {String}
                     */
                    function replaceBundle(message) {
                        return replaceWhat(message, bundle);
                    }

                    /**
                     * @access private
                     * 
                     * @param {String} message
                     * @param {String} why
                     * 
                     * @return {String}
                     */
                    function replaceWhy(message, why) {
                        return message.replace('${why}', why);
                    }

                    /**
                     * @access private
                     * 
                     * @param {String} message
                     * 
                     * @return {String}
                     */
                    function replaceAlreadyLoaded(message) {
                        return replaceWhy(message, alreadyLoaded);
                    }

                    /**
                     * @access private
                     * 
                     * @param {String} message
                     * 
                     * @return {String}
                     */
                    function replaceAlreadyLoading(message) {
                        return replaceWhy(message, alreadyLoading);
                    }

                    /**
                     * @access private
                     * 
                     * @param {Array<number>} messages
                     * @param {String} logLevel
                     */
                    function setLogLevelForMessageTypes(messages, logLevel) {
                        var messageIndex = 0,
                            messagesLen = messages.length;

                        for (; messageIndex < messagesLen; messageIndex++) {
                            messageTypes[messages[messageIndex]] = logLevel;
                        }
                    }

                    setLogLevelForMessageTypes([
                    MSG_BUNDLE_FOUND,
                    MSG_BUNDLE_LOADED,
                    MSG_BUNDLE_LOADING,
                    MSG_BUNDLE_REQUESTED,
                    MSG_DEPENDENCIES_FOUND,
                    MSG_DEPENDENCY_FOUND,
                    MSG_MODULE_LOADED,
                    MSG_MODULE_LOADED_MANUAL,
                    MSG_MODULE_LOADING,
                    MSG_MODULE_PUBLISHED,
                    MSG_MODULE_RECOVERING,
                    MSG_MODULE_REGISTERING,
                    MSG_MODULE_REQUESTED,
                    MSG_MODULE_SUBSCRIBED], 'info');

                    setLogLevelForMessageTypes([
                    MSG_BUNDLE_ABORTED,
                    MSG_CIRCULAR_DEPENDENCIES_FOUND,
                    MSG_INTERCEPTION_ERROR,
                    MSG_TIMEOUT], 'error');

                    setLogLevelForMessageTypes([
                    MSG_BUNDLE_ALREADY_LOADED,
                    MSG_BUNDLE_ALREADY_LOADING,
                    MSG_BUNDLE_NOT_DEFINED,
                    MSG_MODULE_ALREADY_LOADED,
                    MSG_MODULE_ALREADY_LOADED_MANUAL,
                    MSG_MODULE_ALREADY_LOADING,
                    MSG_MODULE_ALREADY_REGISTERED], 'warn');

                    messageTemplates[MSG_BUNDLE_ABORTED] = replaceBundle(abortedLoading);
                    messageTemplates[MSG_BUNDLE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadBundle);
                    messageTemplates[MSG_BUNDLE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadBundle);
                    messageTemplates[MSG_BUNDLE_FOUND] = replaceBundle('found bundlemodules "${bundle}" for ${what}');
                    messageTemplates[MSG_BUNDLE_LOADED] = replaceBundle(endLoad);
                    messageTemplates[MSG_BUNDLE_LOADING] = replaceBundle(startLoad);
                    messageTemplates[MSG_BUNDLE_NOT_DEFINED] = replaceWhy(attemptLoadBundle, 'bundle is not defined');
                    messageTemplates[MSG_BUNDLE_REQUESTED] = replaceBundle(requested);

                    messageTemplates[MSG_CIRCULAR_DEPENDENCIES_FOUND] = replaceModule('found circular dependencies "${deps}" for ${what}');

                    messageTemplates[MSG_DEPENDENCIES_FOUND] = replaceModule('found explicit dependencie(s) "${deps}" for ${what}');
                    messageTemplates[MSG_DEPENDENCY_FOUND] = replaceModule('found implicit dependency "${dep}" for ${what}');

                    messageTemplates[MSG_INTERCEPTION_ERROR] = replaceModule('error in interception of this ${what} by interceptor "${type}" with data "${data}"');

                    messageTemplates[MSG_MODULE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadModule);
                    messageTemplates[MSG_MODULE_ALREADY_LOADED_MANUAL] = replaceAlreadyLoaded(attemptLoadModule) + ' manual';
                    messageTemplates[MSG_MODULE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadModule);

                    messageTemplates[MSG_MODULE_ALREADY_REGISTERED] = replaceWhy(replaceModule(attemptedTo + 'register ${what} but ${why}'), already + 'registered');

                    messageTemplates[MSG_MODULE_LOADED] = replaceModule(endLoad);
                    messageTemplates[MSG_MODULE_LOADED_MANUAL] = replaceModule('${what} was loaded manual');
                    messageTemplates[MSG_MODULE_LOADING] = replaceModule(startLoad) + ' from path "${path}"';

                    messageTemplates[MSG_MODULE_PUBLISHED] = 'was notified by "${pub}"';
                    messageTemplates[MSG_MODULE_RECOVERING] = replaceModule('${what} tries to recover...');
                    messageTemplates[MSG_MODULE_REGISTERING] = replaceModule('registering ${what}...');
                    messageTemplates[MSG_MODULE_REQUESTED] = replaceModule(requested);
                    messageTemplates[MSG_MODULE_SUBSCRIBED] = replaceModule('subscribed to "${subs}"');

                    messageTemplates[MSG_TIMEOUT] = replaceModule(abortedLoading) + ' after ${sec} second(s) - module may not be available on path "${path}"';

                    loggerOptions = {
                        tpl: messageTemplates
                    };

                    function moduleLogMessage(messageType, logBundle, values) {
                        /*jslint validthis: true */
                        var module = this,
                            moduleName = module.getName(logBundle),
                            Logger = module.loader.getModuleRef('System.Logger'),
                            level = messageTypes[messageType] || 'error';

                        if (Logger) {
                            values = values || {};

                            Logger[level + 'WithContext']('Loader:' + moduleName, messageType, values, loggerOptions);
                        }
                    }

                    return moduleLogMessage;
                })(),
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Boolean}
                 */
                checkForCircularDeps: function() {
                    var module = this,
                        hasCircularDependency = false,
                        circularDependencies;

                    if (module.loader.getConfig('checkCircularDeps')) {
                        circularDependencies = module.findCircularDeps();
                        hasCircularDependency = !! circularDependencies.length;

                        if (hasCircularDependency) {
                            module.log(MSG_CIRCULAR_DEPENDENCIES_FOUND, false, {
                                deps: circularDependencies.join(separator)
                            });
                        }
                    }

                    return hasCircularDependency;
                },
                // TODO is there a more performant way to check for circular dependencies?
                // for now turned of in production but can be enabled over JAR.configure('loader', {checkCircularDeps: true})
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Object} traversedModules
                 * 
                 * @return {Array}
                 */
                findCircularDeps: function(traversedModules) {
                    var module = this,
                        moduleName = module.name,
                        dependencies = module.getAllDeps(),
                        depLen = dependencies.length,
                        depIndex = 0,
                        circularDependencies = [];

                    traversedModules = traversedModules || {};

                    if (hasOwnProp(traversedModules, moduleName)) {
                        circularDependencies = [moduleName];
                    }
                    else {
                        traversedModules[moduleName] = true;

                        for (; depIndex < depLen; depIndex++) {
                            circularDependencies = module.loader.getModule(dependencies[depIndex]).findCircularDeps(traversedModules);

                            if (circularDependencies.length) {
                                circularDependencies.unshift(moduleName);
                                break;
                            }
                        }

                        delete traversedModules[moduleName];
                    }

                    return circularDependencies;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
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
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {String} fileType
                 * 
                 * @return {String}
                 */
                getFullPath: function(fileType) {
                    var module = this,
                        fullPath = [module.getConfig('baseUrl'), module.getConfig('dirPath'), module.getConfig('fileName')];

                    fileType = fileType || module.getConfig('fileType');

                    if (fileType !== 'css') {
                        fullPath.push(module.getConfig('versionSuffix'), module.getConfig('minified'));
                    }

                    fullPath.push('.', fileType, module.getConfig('cache') ? '' : '?_=' + new Date().getTime());

                    return fullPath.join('');
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {String} option
                 * @param {String} skipUntil
                 * 
                 * @return {*}
                 */
                getConfig: function(option, skipUntil) {
                    return ConfigurationManager.getModuleConfig(this.name, option, this.options[option], skipUntil);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Object} config
                 */
                setConfig: function(config) {
                    ConfigurationManager.setModuleConfig(config);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                depsLoaded: function() {
                    var module = this;

                    if (module.isRegistered() && !module.isState(MODULE_LOADED)) {
                        module.init();

                        module.setState(MODULE_LOADED);
                        module.log(MSG_MODULE_LOADED);
                        module.notify();
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                bundleLoaded: function() {
                    var module = this;

                    if (!module.isBundleState(MODULE_BUNDLE_LOADED)) {
                        module.setBundleState(MODULE_BUNDLE_LOADED);

                        module.log(module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED, true);

                        module.notify(true);
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Array<string>} moduleNames
                 * @param {Boolean} asBundle
                 */
                listenFor: function(moduleNames, asBundle) {
                    var module = this,
                        loader = module.loader,
                        moduleCount = moduleNames.length,
                        System = loader.getSystem();

                    if (!module.setLoadedIfReady(moduleCount, asBundle) && moduleCount) {
                        module.log(MSG_MODULE_SUBSCRIBED, asBundle, {
                            subs: moduleNames.join(separator)
                        });

                        loader.listenFor(module.getName(asBundle), moduleNames, function onModuleLoaded(publishingModuleName, data) {
                            module.log(MSG_MODULE_PUBLISHED, asBundle, {
                                pub: publishingModuleName
                            });

                            if (System.isSet(data)) {
                                module.interceptorData[publishingModuleName] = data;
                            }

                            module.setLoadedIfReady(-1, asBundle);
                        }, function onModuleAborted() {
                            module.abort(false, asBundle);
                        });
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
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
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Module}
                 */
                request: function() {
                    var module = this,
                        messageType;

                    module.log(MSG_MODULE_REQUESTED);

                    if (module.isState(MODULE_WAITING)) {
                        module.load();
                    }
                    else {
                        messageType = module.isState(MODULE_LOADED) ? MSG_MODULE_ALREADY_LOADED : module.isState(MODULE_LOADED_MANUAL) ? MSG_MODULE_ALREADY_LOADED_MANUAL : MSG_MODULE_ALREADY_LOADING;

                        module.log(messageType);
                    }

                    return module;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Module}
                 */
                requestBundle: function() {
                    var module = this;

                    module.log(MSG_BUNDLE_REQUESTED, true);

                    if (module.isBundleState(MODULE_BUNDLE_WAITING)) {
                        module.setBundleState(MODULE_BUNDLE_LOADING);

                        module.loader.listenFor(module.bundleName, [module.name], function onModuleLoaded() {
                            module.log(MSG_BUNDLE_LOADING, true);
                            module.listenFor(module.bundle, true);
                        }, function onAbort() {
                            module.abort(false, true);
                        });
                    }
                    else {
                        module.log(module.isBundleState(MODULE_BUNDLE_LOADED) ? MSG_BUNDLE_ALREADY_LOADED : MSG_BUNDLE_ALREADY_LOADING, true);
                    }

                    return module;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Object} interceptionInfo
                 * @param {(String|Error)} error
                 */
                logInterceptionError: function(interceptionInfo, error) {
                    var module = this,
                        System = module.loader.getSystem();

                    if (!error) {
                        error = MSG_INTERCEPTION_ERROR;
                    }
                    else if (System.isA(error, Error)) {
                        error = error.message;
                    }

                    module.log(error, false, interceptionInfo);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Function()} callbcack
                 * @param {Function()} errback
                 * @param {Boolean} isBundleRequest
                 */
                onLoad: function(callback, errback, isBundleRequest) {
                    var module = this;

                    if (!module.isState(MODULE_LOADED) || (isBundleRequest && !module.isBundleState(MODULE_BUNDLE_LOADED))) {
                        module.enqueue(callback, errback, isBundleRequest);
                    }
                    else {
                        callback(module.name);
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                load: function() {
                    var module = this,
                        path = module.getFullPath();

                    module.manageImplicitDep();

                    module.log(MSG_MODULE_LOADING, false, {
                        path: path
                    });

                    module.setState(MODULE_LOADING);

                    module.timeoutID = global.setTimeout(function abortModule() {
                        module.abort();
                    }, module.getConfig('timeout') * 1000);

                    SourceManager.addScript(module.loader.context + ':' + module.name, path);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Boolean}
                 */
                findRecover: function() {
                    var module = this,
                        loader = module.loader,
                        moduleName = module.name,
                        foundRecover = module.getConfig('recover', module.nextRecover),
                        recoverModuleName, nextRecoverModule;

                    if (foundRecover) {
                        recoverModuleName = foundRecover.restrict;

                        // This is a recover on a higher level
                        if (recoverModuleName !== moduleName) {
                            // extract the next recovermodule
                            nextRecoverModule = loader.getModule(loader.getModule(recoverModuleName).dep);
                            nextRecoverModule && (module.nextRecover = nextRecoverModule.bundleName);

                            // Only recover this module
                            foundRecover.restrict = moduleName;
                        }

                        module.setConfig(foundRecover);

                        // Restore module recover assoziation
                        foundRecover.restrict = recoverModuleName;

                        module.log(MSG_MODULE_RECOVERING);

                        module.load();
                    }
                    else {
                        delete module.nextRecover;
                    }

                    return !!foundRecover;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Boolean} silent
                 * @param {Boolean} abortBundle
                 */
                abort: function(silent, abortBundle) {
                    var module = this,
                        emptyQueue = false;

                    if (abortBundle) {
                        if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                            module.log(MSG_BUNDLE_ABORTED, true);

                            module.setBundleState(MODULE_BUNDLE_WAITING);
                            emptyQueue = true;
                        }
                    }
                    else if (module.isState(MODULE_LOADING)) {
                        if (!silent) {
                            module.log(MSG_TIMEOUT, false, {
                                path: SourceManager.removeScript(module.loader.context + ':' + module.name),
                                sec: module.getConfig('timeout')
                            });

                            module.setState(MODULE_WAITING);

                            emptyQueue = !module.findRecover();
                        }
                    }
                    else if (module.isState(MODULE_REGISTERED) || module.isState(MODULE_LOADED_MANUAL)) {
                        emptyQueue = true;
                    }

                    if (emptyQueue) {
                        module.dequeue(QUEUE_ERROR, abortBundle);
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Boolean} forBundle
                 * 
                 * @return {String}
                 */
                getName: function(forBundle) {
                    return this[forBundle ? 'bundleName' : 'name'];
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
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
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Function} callback
                 * @param {Function} errback
                 * @param {Boolean} enqueueBundle
                 */
                enqueue: function(callback, errback, enqueueBundle) {
                    this.getQueue(enqueueBundle).push([callback, errback]);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
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
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Function} factory
                 */
                register: function(factory) {
                    var module = this,
                        moduleState;

                    module.factory = factory || Object;

                    module.log(MSG_MODULE_REGISTERING);

                    if (module.isState(MODULE_LOADING)) {
                        global.clearTimeout(module.timeoutID);
                        moduleState = MODULE_REGISTERED;
                    }
                    else {
                        module.log(MSG_MODULE_LOADED_MANUAL);

                        moduleState = MODULE_LOADED_MANUAL;
                    }

                    module.setState(moduleState);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Array} bundle
                 */
                linkBundle: function(bundle) {
                    var module = this;

                    module.bundle = bundle = Resolver.resolveBundle(bundle, module.name);

                    if (bundle.length) {
                        module.log(MSG_BUNDLE_FOUND, true, {
                            bundle: bundle.join(separator)
                        });
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Array} dependencies
                 */
                linkDeps: function(dependencies) {
                    var module = this;

                    module.deps = dependencies = Resolver.resolve(dependencies, module.name);

                    if (dependencies.length) {
                        module.log(MSG_DEPENDENCIES_FOUND, false, {
                            deps: dependencies.join(separator)
                        });
                    }

                    module.listenFor(dependencies);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Number} autoRegisterLevel
                 */
                manageImplicitDep: function(autoRegisterLevel) {
                    var module = this,
                        loader = module.loader,
                        implicitDependency = module.dep;

                    if (implicitDependency) {
                        if (autoRegisterLevel > 0) {
                            loader.getModule(implicitDependency).abort(true);

                            loader.register({
                                MID: implicitDependency,
                                autoRegLvl: --autoRegisterLevel
                            });
                        }
                        else if (module.isState(MODULE_LOADED_MANUAL) || module.isState(MODULE_WAITING)) {
                            module.log(MSG_DEPENDENCY_FOUND, false, {
                                dep: implicitDependency
                            });

                            module.listenFor([implicitDependency]);
                        }
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @param {Boolean} notifyBundle
                 */
                notify: function(notifyBundle) {
                    var module = this;

                    module.loader.getConfig('createDependencyURLList') && module.addToURLList(notifyBundle);

                    module.dequeue(QUEUE_SUCCESS, notifyBundle);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 */
                init: function() {
                    var module = this,
                        loader = module.loader,
                        moduleName = module.name,
                        factory = module.factory,
                        implicitDependency = module.dep,
                        parentRef = (implicitDependency ? loader.getModule(implicitDependency) : loader).ref;

                    loader.setCurrentModuleName(moduleName);

                    module.ref = parentRef[module.options.fileName] = factory.apply(parentRef, module.getDepRefs()) || {};

                    loader.setCurrentModuleName(Resolver.getRootName());
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager~Module#
                 * 
                 * @return {Array}
                 */
                getDepRefs: function() {
                    var module = this,
                        loader = module.loader,
                        dependencies = module.deps,
                        depLen = dependencies.length,
                        depIndex = 0,
                        depRefs = [],
                        System = loader.getSystem(),
                        data, dependencyName;

                    for (; depIndex < depLen; depIndex++) {
                        dependencyName = dependencies[depIndex];
                        data = module.interceptorData[dependencyName];
                        depRefs.push(System.isSet(data) ? data : loader.getModule(dependencyName).ref);
                    }

                    return depRefs;
                }
            };

            return Module;
        })();

        /**
         * @access private
         * 
         * @constructor Loader
         * 
         * @memberof JAR~LoaderManager
         * @inner
         * 
         * @param {String} context
         */
        function Loader(context) {
            var loader = this;

            loader.context = context;
            loader.currentModuleName = Resolver.getRootName();
        }

        Loader.prototype = {
            /**
             * @access public
             * 
             * @alias JAR~LoaderManager~Loader
             * 
             * @memberof JAR~LoaderManager~Loader#
             */
            constructor: Loader,
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             */
            init: function() {
                var loader = this;

                loader.modules = {};
                loader.ref = {};

                loader.resetModulesURLList();

                loader.registerCore();
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} moduleName
             */
            setCurrentModuleName: function(moduleName) {
                this.currentModuleName = moduleName;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} option
             * 
             * @return {*}
             */
            getConfig: function(option) {
                return ConfigurationManager.getLoaderConfig(option);
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @return {String}
             */
            getCurrentModuleName: function() {
                return this.currentModuleName;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @return {Object}
             */
            getSystem: function() {
                return this.getModuleRef('System');
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {*}
             */
            getModuleRef: function(moduleName) {
                return this.getModule(moduleName).ref;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {JAR~LoaderManager~Module}
             */
            getModule: function(moduleName) {
                var loader = this;

                if (Resolver.isBundleRequest(moduleName)) {
                    moduleName = Resolver.extractModuleNameFromBundle(moduleName);
                }
                else {
                    moduleName = Resolver.extractInterceptorInfo(moduleName).moduleName;
                }

                return loader.modules[moduleName] || loader.createModule(moduleName);
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {JAR~LoaderManager~Module}
             */
            createModule: function(moduleName) {
                var loader = this,
                    module = loader.modules[moduleName] = new Module(loader, moduleName);

                return module;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {Function(Module)} callback
             */
            eachModules: function(callback) {
                var loader = this,
                    modules = loader.modules,
                    moduleName;

                for (moduleName in modules) {
                    hasOwnProp(modules, moduleName) && callback(modules[moduleName]);
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             */
            registerCore: function() {
                var loader = this,
                    moduleName, coreModule, properties;

                for (moduleName in loaderCoreModules) {
                    if (hasOwnProp(loaderCoreModules, moduleName)) {
                        coreModule = loaderCoreModules[moduleName];
                        properties = coreModule[0] || {};
                        properties.MID = moduleName;
                        loader.register(properties, coreModule[1]);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {Object} properties
             * @param {Function():*} factory
             */
            register: function(properties, factory) {
                var loader = this,
                    moduleName = properties.MID,
                    module = loader.getModule(moduleName);

                if (!module.isRegistered(true)) {
                    module.register(factory);

                    if (properties.styles) {
                        SourceManager.addStyleSheet(moduleName, module.getFullPath('css'));
                    }

                    module.linkBundle(properties.bundle);

                    module.linkDeps(properties.deps);

                    module.manageImplicitDep(properties.autoRegLvl);

                    if (module.checkForCircularDeps()) {
                        module.abort();
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} listeningModuleName
             * @param {Array<string>} moduleNames
             * @param {Function(string)} callback
             * @param {Function(string)} errback
             */
            listenFor: function(listeningModuleName, moduleNames, callback, errback) {
                var loader = this,
                    moduleCount = moduleNames.length,
                    moduleIndex = 0,
                    moduleName;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    moduleName = moduleNames[moduleIndex];

                    loader.$import(moduleName).onLoad(loader.intercept(moduleName, listeningModuleName, callback, errback), errback, Resolver.isBundleRequest(moduleName));
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} interceptedModuleName
             * @param {String} listeningModuleName
             * @param {Function(string, *)} callback
             * @param {Function(string)} errback
             * 
             * @return {Function(string)}
             */
            intercept: function(interceptedModuleName, listeningModuleName, callback, errback) {
                var loader = this,
                    interceptorInfo = Resolver.extractInterceptorInfo(interceptedModuleName);

                return interceptorInfo.type ? function interceptionListener(moduleName) {
                    interceptors[interceptorInfo.type]({
                        listener: listeningModuleName,

                        module: loader.getModuleRef(moduleName),

                        data: interceptorInfo.data,

                        $import: LoaderManager.$importLazy,

                        $importAndLink: function(moduleNames, callback, errback, progressback) {
                            var listeningModule, interceptorDeps;

                            moduleNames = Resolver.resolve(moduleNames, interceptedModuleName);

                            if (!Resolver.isRootName(listeningModuleName)) {
                                listeningModule = loader.getModule(listeningModuleName),
                                interceptorDeps = listeningModule.interceptorDeps;
                                interceptorDeps.push.apply(interceptorDeps, moduleNames);
                            }

                            LoaderManager.$importLazy(moduleNames, callback, errback, progressback);
                        },

                        success: function(data) {
                            callback(interceptedModuleName, data);
                        },

                        fail: function(error) {
                            loader.getModule(interceptedModuleName).logInterceptionError(interceptorInfo, error);

                            errback(interceptedModuleName);
                        }
                    });
                } : callback;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {JAR~LoaderManager~Module}
             */
            $import: function(moduleName) {
                return this['$import' + (Resolver.isBundleRequest(moduleName) ? 'Bundle' : 'Module')](moduleName);
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {JAR~LoaderManager~Module}
             */
            $importModule: function(moduleName) {
                return this.getModule(moduleName).request();
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {String} bundleName
             * 
             * @return {JAR~LoaderManager~Module}
             */
            $importBundle: function(bundleName) {
                return this.getModule(bundleName).requestBundle();
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {JAR~LoaderManager~Module} module
             * @param {Boolean} addBundle
             */
            addToURLList: function(module, addBundle) {
                var loader = this,
                    moduleName = module.name,
                    sortedModules = loader.sorted,
                    dependencies = module.getAllDeps();

                if (module.isLoaded()) {
                    if (!hasOwnProp(sortedModules, moduleName)) {
                        loader.pushModules(dependencies);

                        loader.list.push(module.getFullPath());
                        sortedModules[moduleName] = true;
                    }

                    if (addBundle) {
                        loader.pushModules(module.bundle);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             * 
             * @param {Array} modules
             */
            pushModules: function(modules) {
                var moduleIndex = 0,
                    moduleCount, moduleName;

                moduleCount = modules ? modules.length : 0;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    moduleName = modules[moduleIndex];

                    this.addToURLList(this.getModule(moduleName), Resolver.isBundleRequest(moduleName));
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager~Loader#
             */
            resetModulesURLList: function() {
                var loader = this,
                    moduleName;

                loader.list = [];
                loader.sorted = {};

                for (moduleName in loaderCoreModules) {
                    if (hasOwnProp(loaderCoreModules, moduleName)) {
                        loader.sorted[moduleName] = true;
                    }
                }
            }
        };

        Resolver = (function resolverSetup() {
            var rEndSlash = /\/$/,
                slash = '/',
                rBundleRequest = /\.\*$/,
                bundleSuffix = '.*',
                rLeadingDot = /^\./,
                dot = '.',
                versionDelimiter = '@',
                rVersionWithoutPatch = /(\d+\.\d+\.)\d+.+/,
                rootModuleName = '*',
                interceptorInfoCache = {},
                defaultResolverErrorMessage = 'Could not resolve "${0}" relative to "${1}": ',
                resolverErrorTemplates = [],
                RESOLVE_DEPS = 0,
                RESOLVE_BUNDLE = 1,
                RESOLVE_NESTED = 2,
                resolverLoggerOptions,
                Resolver;

            resolverErrorTemplates[RESOLVE_DEPS] = defaultResolverErrorMessage + 'a dependency modulename must be absolute or relative to the current module.';
            resolverErrorTemplates[RESOLVE_BUNDLE] = defaultResolverErrorMessage + 'a bundle modulename must not start with a ".".';
            resolverErrorTemplates[RESOLVE_NESTED] = defaultResolverErrorMessage + 'a nested modulename must not start with a "." or only contain it as a special symbol.';

            resolverLoggerOptions = {
                tpl: resolverErrorTemplates
            };

            /**
             * @access private
             * 
             * @memberof JAR~LoaderManager.Resolver
             * @inner
             * 
             * @param {String} moduleName
             * 
             * @return {Boolean}
             */
            function resolverIsRelativeModuleName(moduleName) {
                return rLeadingDot.test(moduleName);
            }

            /**
             * @access public
             * 
             * @namespace Resolver
             * 
             * @memberof JAR~LoaderManager
             */
            Resolver = {
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {String}
                 */
                isRootName: function(moduleName) {
                    return rootModuleName === moduleName;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @return {String}
                 */
                getRootName: function() {
                    return rootModuleName;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {Object}
                 */
                getPathOptions: function(moduleName) {
                    var options = {},
                        versionParts = moduleName.split(versionDelimiter),
                        pathParts = versionParts[0].split(dot),
                        fileName = options.fileName = pathParts.pop(),
                        firstLetterFileName = fileName.charAt(0);

                    versionParts[1] && (options.versionSuffix = '-' + versionParts[1]);

                    if (firstLetterFileName === firstLetterFileName.toLowerCase()) {
                        pathParts.push(fileName);
                    }

                    options.dirPath = pathParts.join(slash) + slash;

                    return options;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} path
                 * 
                 * @return {String}
                 */
                ensureEndsWithSlash: function(path) {
                    return (!path || rEndSlash.test(path)) ? path : path + slash;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {String}
                 */
                getBundleName: function(moduleName) {
                    return moduleName + bundleSuffix;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {String}
                 */
                getImplicitDependencyName: function(moduleName) {
                    var versionParts = moduleName.split(versionDelimiter),
                        version = versionParts[1];

                    moduleName = versionParts[0];
                    moduleName = moduleName.substr(0, moduleName.lastIndexOf('.'));

                    versionParts[0] = moduleName;

                    version && (version = version.replace(rVersionWithoutPatch, '$10'));

                    return Resolver.appendVersion(moduleName, version);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {Boolean}
                 */
                isVersionedModule: function(moduleName) {
                    return moduleName.indexOf(versionDelimiter) > -1;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * @param {String} version
                 * 
                 * @return {String}
                 */
                appendVersion: function(moduleName, version) {
                    return (moduleName && version) ? [moduleName, version].join(versionDelimiter) : moduleName;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {String}
                 */
                extractModuleNameFromBundle: function(moduleName) {
                    return moduleName.replace(rBundleRequest, '');
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {Boolean}
                 */
                isBundleRequest: function(moduleName) {
                    return rBundleRequest.test(moduleName);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * 
                 * @return {Array}
                 */
                extractInterceptorInfo: function(moduleName) {
                    var interceptorInfo = interceptorInfoCache[moduleName],
                        moduleParts, interceptorType;

                    if (!interceptorInfo) {
                        for (interceptorType in interceptors) {
                            if (hasOwnProp(interceptors, interceptorType) && moduleName.indexOf(interceptorType) > -1) {
                                moduleParts = moduleName.split(interceptorType);

                                interceptorInfo = {
                                    moduleName: moduleParts.shift(),
                                    type: interceptorType,
                                    data: moduleParts.join(interceptorType)
                                };

                                break;
                            }
                        }

                        interceptorInfo = interceptorInfoCache[moduleName] = interceptorInfo || {
                            moduleName: moduleName
                        };
                    }

                    return interceptorInfo;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {Array} modules
                 * @param {String} referenceModuleName
                 * @param {Number} resolveType
                 * 
                 * @return {Array<string>}
                 */
                resolveArray: function(modules, referenceModuleName, resolveType) {
                    var resolvedModules = [],
                        moduleIndex = 0,
                        moduleCount = modules.length;

                    for (; moduleIndex < moduleCount; moduleIndex++) {
                        resolvedModules = resolvedModules.concat(Resolver.resolve(modules[moduleIndex], referenceModuleName, resolveType));
                    }

                    return resolvedModules;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {Object} modules
                 * @param {String} referenceModuleName
                 * @param {Number} resolveType
                 * 
                 * @return {Array<string>}
                 */
                resolveObject: function(modules, referenceModuleName, resolveType) {
                    var resolvedModules = [],
                        tmpReferenceModuleName;

                    for (tmpReferenceModuleName in modules) {
                        if (hasOwnProp(modules, tmpReferenceModuleName)) {
                            resolvedModules = resolvedModules.concat(Resolver.resolve(modules[tmpReferenceModuleName], tmpReferenceModuleName, RESOLVE_NESTED));
                        }
                    }

                    return Resolver.resolveArray(resolvedModules, referenceModuleName, resolveType);
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {String} moduleName
                 * @param {String} referenceModuleName
                 * @param {Number} resolveType
                 * 
                 * @return {Array<string>}
                 */
                resolveString: function(moduleName, referenceModuleName, resolveType) {
                    var origModuleName = moduleName,
                        isValidModuleName = !resolverIsRelativeModuleName(moduleName),
                        resolvedModules = [],
                        refParts = [],
                        Logger;

                    if (!Resolver.isRootName(referenceModuleName) && (resolveType !== RESOLVE_DEPS || !isValidModuleName)) {
                        refParts = referenceModuleName.split(dot);

                        if (resolveType === RESOLVE_NESTED && !isValidModuleName && moduleName === dot) {
                            moduleName = '';
                            isValidModuleName = true;
                        }
                        else if (resolveType === RESOLVE_DEPS && !isValidModuleName && !resolverIsRelativeModuleName(referenceModuleName)) {
                            while (refParts.length && resolverIsRelativeModuleName(moduleName)) {
                                moduleName = moduleName.substr(1);
                                refParts.pop();
                            }

                            isValidModuleName = !resolverIsRelativeModuleName(moduleName) && !! (moduleName || refParts.length);
                        }
                    }

                    if (isValidModuleName) {
                        resolvedModules = [Resolver.buildAbsoluteModuleName(refParts, moduleName)];
                    }
                    else {
                        Logger = LoaderManager.getModuleRef('System.Logger');
                        Logger.errorWithContext('Resolver', resolveType, [origModuleName, referenceModuleName], resolverLoggerOptions);
                    }

                    return resolvedModules;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {Array} refParts
                 * @param {String} moduleName
                 * 
                 * @return {String}
                 */
                buildAbsoluteModuleName: function(refParts, moduleName) {
                    var interceptorData = '';

                    if (moduleName) {
                        if (!Resolver.extractInterceptorInfo(moduleName).moduleName) {
                            interceptorData = moduleName;
                        }
                        else {
                            refParts.push(moduleName);
                        }
                    }

                    return refParts.join('.') + interceptorData;
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {(String|Object|Array)} modules
                 * @param {String} referenceModuleName
                 * @param {Number} resolveType
                 * 
                 * @return {Array<string>}
                 */
                resolve: function(modules, referenceModuleName, resolveType) {
                    var resolverFn, type;

                    if (modules) {
                        resolverFn = 'resolve';

                        type = LoaderManager.getSystem().getType(modules);

                        resolverFn += (type.charAt(0).toUpperCase() + type.substr(1));
                    }

                    return Resolver[resolverFn] ? Resolver[resolverFn](modules, referenceModuleName || Resolver.getRootName(), resolveType || RESOLVE_DEPS) : [];
                },
                /**
                 * @access public
                 * 
                 * @memberof JAR~LoaderManager.Resolver
                 * 
                 * @param {(String|Object|Array)} modules
                 * @param {String} referenceModuleName
                 * 
                 * @return {Array<string>}
                 */
                resolveBundle: function(modules, referenceModuleName) {
                    return Resolver.resolve(modules, referenceModuleName, RESOLVE_BUNDLE);
                }
            };

            return Resolver;
        })();

        /**
         * @access private
         * 
         * @namespace LoaderManager
         * 
         * @memberof JAR
         * @inner
         */
        LoaderManager = {
            Resolver: Resolver,
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {String} context
             * 
             * @return {String}
             */
            setContext: function(context) {
                var createContext = !hasOwnProp(loaders, context);

                LoaderManager.loader = loaders[context] = createContext ? new Loader(context) : loaders[context];
                createContext && loaders[context].init();

                return context;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {String} context
             * 
             * @return {Boolean}
             */
            flush: function(context) {
                var loader = context ? loaders[context] : LoaderManager.loader;

                if (loader) {
                    loader.eachModules(function(module) {
                        module.abort(true);
                    });

                    loader.init();
                    loader.getModuleRef('System.Logger').info('flushed Loader with context "${0}"', [loader.context]);
                }

                return !!loader;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {String} moduleName
             * @param {Object} properties
             * @param {Function()} factory
             */
            addCoreModule: function(moduleName, properties, factory) {
                loaderCoreModules[moduleName] = [properties, factory];
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {String} interceptorType
             * @param {Function(object)} interceptor
             */
            addInterceptor: function(interceptorType, interceptor) {
                if (!hasOwnProp(interceptors, interceptorType)) {
                    interceptors[interceptorType] = interceptor;
                }

                return interceptors;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @return {String}
             */
            getCurrentModuleName: function() {
                return LoaderManager.loader.getCurrentModuleName();
            },
            /**
             * <p>Computes an array of all the loaded modules
             * in the order they are dependending on each other.
             * This method can be used to create a custom build
             * preferable with grunt and phantomjs.</p>
             * 
             * <p>It is possible to recompute the list.
             * This is only for aesthetics.
             * Even without recomputation the list will still be valid.</p>
             * 
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {Function(array)} loadedCallback
             * @param {Boolean} forceRecompute
             */
            getDependencyURLList: function(loadedCallback, forceRecompute) {
                var loader = LoaderManager.loader,
                    modulesToLoad = [],
                    modulesLoading = 0;

                loader.eachModules(function addModuleToLoad(module) {
                    if (module.isLoading()) {
                        modulesToLoad.push(module.name);
                        modulesLoading++;
                    }
                });

                if (modulesLoading) {
                    loader.listenFor(Resolver.getRootName(), modulesToLoad, function() {
                        --modulesLoading || LoaderManager.getDependencyURLList(loadedCallback, forceRecompute);
                    });
                }
                else {
                    if (forceRecompute || !(loader.getConfig('createDependencyURLList') || loader.list.length)) {
                        loader.resetModulesURLList();

                        loader.eachModules(function addModuleToURLList(module) {
                            loader.addToURLList(module);
                        });
                    }

                    loadedCallback(loader.list);
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {String} moduleName
             * 
             * @return {*}
             */
            getModuleRef: function(moduleName) {
                return LoaderManager.loader.getModuleRef(moduleName);
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @return {Object}
             */
            getSystem: function() {
                return LoaderManager.loader.getSystem();
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @return {Object}
             */
            getRoot: function() {
                return LoaderManager.loader.ref;
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {(Object|Array|String)} moduleNames
             * @param {Function(...*)} callback
             * @param {Function(string)} errback
             * @param {Function(string)} progressback
             */
            $importLazy: function(moduleNames, callback, errback, progressback) {
                var loader = LoaderManager.loader,
                    moduleName = loader.getCurrentModuleName(),
                    System = loader.getSystem(),
                    refs = [],
                    refsIndexLookUp = {},
                    moduleIndex = 0,
                    ref, counter, moduleCount;

                moduleNames = Resolver.resolve(moduleNames, moduleName);
                counter = moduleCount = moduleNames.length;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    refsIndexLookUp[moduleNames[moduleIndex]] = moduleIndex;
                }

                System.isFunction(progressback) || (progressback = undef);

                loader.listenFor(moduleName, moduleNames, function publishLazy(publishingModuleName, data) {
                    ref = System.isSet(data) ? data : loader.getModuleRef(publishingModuleName);
                    refs[refsIndexLookUp[publishingModuleName]] = ref;

                    counter--;

                    progressback && progressback(ref, Number((1 - counter / moduleCount).toFixed(2)));

                    counter || callback.apply(null, refs);
                }, errback);
            },
            /**
             * @access public
             * 
             * @memberof JAR~LoaderManager
             * 
             * @param {Object} properties
             * @param {Function()} factory
             */
            register: function(properties, factory) {
                var moduleName = properties.MID = Resolver.appendVersion(properties.MID, properties.version),
                    defaultContext = LoaderManager.loader.context,
                    loaderContext, loader;

                if (!SourceManager.findScript(defaultContext + ':' + moduleName)) {
                    for (loaderContext in loaders) {
                        if (hasOwnProp(loaders, loaderContext) && SourceManager.findScript(loaderContext + ':' + moduleName)) {
                            LoaderManager.setContext(loaderContext);
                            break;
                        }
                    }
                }

                loader = LoaderManager.loader;

                loader.register(properties, factory);

                if (loader !== loaders[defaultContext]) {
                    LoaderManager.setContext(defaultContext);
                }
            }
        };

        return LoaderManager;
    })();

    LoaderManager.addInterceptor('!', function pluginInterceptor(options) {
        var moduleRef = options.module,
            errback = options.fail;

        delete options.module;

        if (LoaderManager.getSystem().isFunction(moduleRef.$plugIn)) {
            moduleRef.$plugIn(options);
        }
        else {
            errback('Could not call method "$plugIn" on this module');
        }
    });

    LoaderManager.addInterceptor('::', function partialModuleInterceptor(options) {
        var moduleRef = options.module,
            property = options.data;

        if (moduleRef && hasOwnProp(moduleRef, property)) {
            options.success(moduleRef[property]);
        }
        else {
            options.fail('the module has no property "' + property + '"');
        }
    });

    LoaderManager.addCoreModule('System', {}, function systemSetup() {
        var types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
            nothing = null,
            typesLen = types.length,
            typeLookup = {},
            toString = ({}).toString,
            typeIndex = 0,
            isArgs, System;

        /**
         * @access public
         * 
         * @namespace System
         */
        System = {
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {*} value
             * 
             * @return {String}
             */
            getType: function getType(value) {
                var type;

                if (System.isSet(value)) {
                    if (value.nodeType === 1 || value.nodeType === 9) {
                        type = 'element';
                    }
                    else {
                        type = typeLookup[toString.call(value)];

                        if (type === 'number') {
                            if (isNaN(value)) {
                                type = 'nan';
                            }
                            else if (!isFinite(value)) {
                                type = 'infinity';
                            }
                        }
                    }
                }
                else {
                    type = String(value);
                }

                return type || typeof value;
            },
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {*} value
             * 
             * @return {Boolean}
             */
            isSet: function(value) {
                return value != nothing;
            },
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {*} value
             * 
             * @return {Boolean}
             */
            isArrayLike: function(value) {
                var isArrayLike = false,
                    length;

                if (value) {
                    length = value.length;

                    isArrayLike = System.isArray(value) || (System.isNumber(length) && length === 0 || (length > 0 && ((length - 1) in value)));
                }

                return isArrayLike;
            },
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {*} value
             * 
             * @return {Boolean}
             */
            isDefined: function(value) {
                return !System.isUndefined(value);
            },
            /**
             * @access public
             * 
             * @function
             * @memberof System
             * 
             * @param {*} value
             * 
             * @return {Boolean}
             */
            isInteger: Number.isInteger || function(value) {
                return System.isNumber(value) && parseInt(value, 10) === value;
            },
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {*} value
             * 
             * @return {Boolean}
             */
            isNaN: function(value) {
                return global.isNaN(value) && value !== value;
            },
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {Object} instance
             * @param {(Function|Array<function>)} Class
             * 
             * @return {Boolean}
             */
            isA: function(instance, Class) {
                var isA = false,
                    classIndex = 0,
                    classLen = Class.length;

                if (System.isArray(Class)) {
                    for (; classIndex < classLen; classIndex++) {
                        isA = System.isA(instance, Class[classIndex]);

                        if (isA) {
                            break;
                        }
                    }
                }
                else {
                    isA = instance instanceof Class;
                }

                return isA;
            },
            /**
             * @access public
             * 
             * @memberof System
             * 
             * @param {Object} pluginRequest
             */
            $plugIn: function(pluginRequest) {
                var module = LoaderManager.loader.getModule(pluginRequest.listener);

                pluginRequest.success(function configGetter(option) {
                    return (module.getConfig('config') || {})[option];
                });
            }
        };

        /**
         * @access public
         * 
         * @function isNull
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isUndefined
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isString
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNumber
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isBoolean
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isArray
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isObject
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isFunction
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isDate
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isRegExp
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */

        /**
         * @access private
         * 
         * @memberof System
         * @inner
         * 
         * @param {String} typeDef
         * 
         * @return {Function(*):boolean}
         */
        function typeValidatorSetup(typeDef) {
            var nativeTypeValidator = global[typeDef] && global[typeDef]['is' + typeDef];

            typeLookup['[object ' + typeDef + ']'] = typeDef = typeDef.toLowerCase();

            return nativeTypeValidator || function typeValidator(value) {
                return System.getType(value) === typeDef;
            };
        }

        for (; typeIndex < typesLen; typeIndex++) {
            System['is' + types[typeIndex]] = typeValidatorSetup(types[typeIndex]);
        }

        isArgs = System.isArguments;

        /**
         * @access public
         * 
         * @memberof System
         * 
         * @param {*} value
         * 
         * @return {Boolean}
         */
        System.isArguments = function(value) {
            return value && (isArgs(value) || System.isArrayLike(value));
        };

        return System;
    });

    LoaderManager.addCoreModule('System.Comparators', {}, function systemComparatorsSetup() {
        var comparisons = {
            Equal: {
                operator: '==',
                alias: 'eq'
            },
            StrictEqual: {
                operator: '===',
                alias: 'seq'
            },
            LowerThan: {
                operator: '<',
                alias: 'lt'
            },
            LowerThanOrEqual: {
                operator: '<=',
                alias: 'lte'
            },
            GreaterThan: {
                operator: '>',
                alias: 'gt'
            },
            GreaterThanOrEqual: {
                operator: '>=',
                alias: 'gte'
            }
        },
            comparisonName, comparison, Comparators;

        /**
         * @access public
         * 
         * @namespace Comparators
         * @memberof System
         */
        Comparators = {};

        /**
         * @access private
         * 
         * @memberof System
         * @inner
         * 
         * @param {String} operator
         * @param {Boolean} negate
         * 
         * @return {Function(*, *):boolean}
         */
        function comparatorSetup(operator, negate) {
            /*jslint evil: true */
            var comparator = new Function('a,b', 'return ' + (negate ? '!' : '') + '(a' + operator + 'b)');

            return comparator;
        }

        for (comparisonName in comparisons) {
            if (hasOwnProp(comparisons, comparisonName)) {
                comparison = comparisons[comparisonName];

                Comparators['is' + comparisonName] = Comparators[comparison.alias] = comparatorSetup(comparison.operator);
                Comparators['isNot' + comparisonName] = Comparators['n' + comparison.alias] = comparatorSetup(comparison.operator, true);
            }
        }

        /**
         * @access public
         * 
         * @function isEqual
         * @alias eq
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNotEqual
         * @alias neq
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isStrictEqual
         * @alias seq
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNotStrictEqual
         * @alias nseq
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isLowerThan
         * @alias lt
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNotLowerThan
         * @alias nlt
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isLowerThanOrEqual
         * @alias lte
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNotLowerThanOrEqual
         * @alias nlte
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isGreaterThan
         * @alias gt
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNotGreaterThan
         * @alias ngt
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isGreaterThanOrEqual
         * @alias gte
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        /**
         * @access public
         * 
         * @function isNotGreaterThanOrQual
         * @alias ngte
         * @memberof System.Comparators
         * 
         * @param {*} value
         * @param {*} compareValue
         * 
         * @return {Boolean}
         */

        return Comparators;
    });

    LoaderManager.addCoreModule('System.Logger', {
        deps: '.!'
    }, function systemLoggerSetup(config) {
        var System = this,
            debuggers = {},
            stdLevels = 'log info debug warn error'.split(' '),
            stdLevelsLen = stdLevels.length,
            levelIndex = 0,
            rTemplateKey = /\$\{(.*?)\}/g,
            loggerCache = {};

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {Array} match
         * @param {String} key
         * 
         * @return {String}
         */
        function formatLog(match, key) {
            return formatLog.values[key] || 'UNKNOWN';
        }

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {(String|Number)} levelOrPriority
         * 
         * @return {Number}
         */
        function getPriority(levelOrPriority) {
            var logLevels = Logger.logLevels,
                priority = logLevels.ALL;

            if (System.isString(levelOrPriority) && hasOwnProp(logLevels, (levelOrPriority = levelOrPriority.toUpperCase()))) {
                priority = logLevels[levelOrPriority];
            }
            else if (System.isNumber(levelOrPriority)) {
                priority = levelOrPriority;
            }

            return priority;
        }

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {Boolean} debug
         * @param {String} level
         * @param {String} context
         * 
         * @return {Boolean}
         */
        function isDebuggingEnabled(debug, level, context) {
            return debug && comparePriority(level) && compareDebugContext(context);
        }

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {String} level
         * 
         * @return {Boolean}
         */
        function comparePriority(level) {
            return getPriority(level) >= getPriority(config('level'));
        }

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {String} context
         * 
         * @return {Boolean}
         */
        function compareDebugContext(context) {
            var debugContext = config('context'),
                includeContext, excludeContext;

            if (System.isObject(debugContext)) {
                includeContext = debugContext.include;
                excludeContext = debugContext.exclude;
            }
            else {
                includeContext = debugContext;
            }

            return includeContext ? inContextList(context, includeContext) : excludeContext ? !inContextList(context, excludeContext) : true;
        }

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {String} level
         * @param {(Array|String)} contextList
         * 
         * @return {Boolean}
         */
        function inContextList(context, contextList) {
            var contextDelimiter = ',';

            if (System.isArray(contextList)) {
                contextList = contextList.join(contextDelimiter);
            }

            contextList = contextDelimiter + contextList + contextDelimiter;

            return contextList.indexOf(contextDelimiter + context + contextDelimiter) > -1;
        }

        /**
         * @access private
         * 
         * @memberof System.Logger
         * @inner
         * 
         * @param {String} mode
         * 
         * @return {Object}
         */
        function getActiveDebugger(mode) {
            return debuggers[mode] || debuggers.console;
        }

        /**
         * @access public
         * 
         * @memberof System
         * 
         * @class Logger
         * 
         * @param {String} logContext
         * @param {Object} options
         */
        function Logger(logContext, options) {
            var logger = this;

            logger.context = logContext || 'Default';
            loggerCache[logContext] = logger;

            logger.options = options || {};
            logger.options.tpl = logger.options.tpl || {};
        }

        /**
         * @access private
         * 
         * @memberof System.Logger#
         * 
         * @param {String} level
         * @param {*} message
         * @param {(Object|Array)} values
         */
        Logger.prototype._out = function(level, message, values) {
            var logger = this,
                context = logger.context,
                options = logger.options,
                currentDebugger = getActiveDebugger(options.mode || config('mode')),
                debuggerMethod = currentDebugger[level] ? level : 'log';

            if (isDebuggingEnabled(options.debug || config('debug'), level, context) && System.isFunction(currentDebugger[debuggerMethod])) {
                message = options.tpl[message] || message;

                if (System.isString(message) && (System.isObject(values) || System.isArray(values))) {
                    formatLog.values = values;

                    message = message.replace(rTemplateKey, formatLog);

                    formatLog.values = null;
                }

                currentDebugger[debuggerMethod](context, {
                    timestamp: new Date().toUTCString(),

                    message: message
                });
            }
        };
        /**
         * @access public
         * 
         * @memberof System.Logger
         * 
         * @type {Object<string, number>}
         */
        Logger.logLevels = {
            ALL: -Infinity
        };

        /**
         * @access public
         * 
         * @memberof System.Logger
         * 
         * @param {String} level
         * @param {Number} priority
         */
        Logger.addLogLevel = function(level, priority) {
            var levelConst = level.toUpperCase();

            if (!hasOwnProp(Logger.logLevels, levelConst)) {
                Logger.logLevels[levelConst] = System.isNumber(priority) ? priority : Logger.logLevels.ALL;

                Logger.prototype[level] = function loggerFn(data, values) {
                    this._out(level, data, values);
                };

                Logger[level] = function staticLoggerFn(data, values) {
                    Logger[level + 'WithContext']('JAR', data, values);
                };

                Logger[level + 'WithContext'] = function staticLoggerFnWithContext(logContext, data, values, options) {
                    (loggerCache[logContext] || new Logger(logContext, options))[level](data, values);
                };
            }
        };

        /**
         * @access public
         * 
         * @memberof System.Logger
         * 
         * @param {Object} options
         * 
         * @return {System.Logger}
         */
        Logger.forCurrentModule = function(options) {
            var logContext = LoaderManager.getCurrentModuleName();

            LoaderManager.Resolver.isRootName(logContext) && (logContext = 'JAR');

            return loggerCache[logContext] || new Logger(logContext, options);
        };

        /**
         * @access public
         * 
         * @memberof System.Logger
         * 
         * @param {Object} pluginRequest
         */
        Logger.$plugIn = function(pluginRequest) {
            var data = pluginRequest.data.split(':');

            pluginRequest.$importAndLink(data[1], function(Debugger) {
                Logger.addDebugger(data[0], Debugger.setup);

                pluginRequest.success(Logger);
            }, pluginRequest.fail);
        };

        /**
         * @access public
         * 
         * @memberof System.Logger
         * 
         * @param {String} mode
         * @param {Function} debuggerSetup
         */
        Logger.addDebugger = function(mode, debuggerSetup) {
            var modeConfig = mode + 'Config';

            if (!hasOwnProp(debuggers, mode) && System.isFunction(debuggerSetup)) {
                debuggers[mode] = debuggerSetup(function debuggerConfigGetter(option) {
                    return (config(modeConfig) || {})[option];
                });
            }
        };

        for (; levelIndex < stdLevelsLen; levelIndex++) {
            Logger.addLogLevel(stdLevels[levelIndex], (levelIndex + 1) * 10);
        }

        Logger.addDebugger('console', function consoleDebuggerSetup(config) {
            var console = global.console,
                canUseGroups = console && console.group && console.groupEnd,
                pseudoConsole = {},
                levelIndex = 0,
                method,
                lastLogContext;

            for (; levelIndex < stdLevelsLen; levelIndex++) {
                method = stdLevels[levelIndex];
                pseudoConsole[method] = console ? forwardConsole(console[method] ? method : stdLevels[0]) : noop;
            }

            function noop() {}

            function forwardConsole(method) {
                return function log(logContext, data) {
                    var throwError = method === 'error' && config('throwError'),
                        metainfo = [];

                    config('timestamp') && metainfo.push('[' + data.timestamp + ']');

                    if (!(canUseGroups && config('groupByContext')) || throwError) {
                        metainfo.push('[' + logContext + ']');

                        if (throwError) {
                            throw new Error(metainfo.join(' ') + ' -> ' + data.message);
                        }
                    }
                    else if (lastLogContext !== logContext) {
                        lastLogContext && global.console.groupEnd(lastLogContext);

                        global.console.group(logContext);

                        lastLogContext = logContext;
                    }

                    global.console[method](metainfo.join(' '), data.message);
                };
            }

            return pseudoConsole;
        });

        return Logger;
    });

    LoaderManager.addCoreModule('jar', {
        bundle: ['async.*', 'feature.*', 'html.*', 'lang.*', 'util.*']
    }, function() {
        /**
         * @namespace jar
         * 
         * @borrows LoaderManager.getModuleRef as use
         * @borrows LoaderManager.$importLazy as $importLazy
         * @borrows LoaderManager.getCurrentModuleName as getCurrentModuleName
         */
        var jar = {
            /**
             * @access public
             * 
             * @memberof jar
             * 
             * @param {(Object|Array|String)} moduleNames
             * 
             * @return {Array}
             */
            useAll: function(moduleNames) {
                var moduleIndex = 0,
                    refs = [],
                    moduleCount;

                moduleNames = LoaderManager.Resolver.resolve(moduleNames);
                moduleCount = moduleNames.length;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    refs.push(jar.use(moduleNames[moduleIndex]));
                }

                return refs;
            },

            use: LoaderManager.getModuleRef,

            $importLazy: LoaderManager.$importLazy,

            getCurrentModuleName: LoaderManager.getCurrentModuleName
        };

        return jar;
    });

    LoaderManager.setContext('default');

    global.JAR = (function jarSetup() {
        var previousJAR = global.JAR,
            moduleNamesQueue = [],
            configurators = {},
            configs = {
                bundle: [],
                environment: undef,
                environments: {},
                globalAccess: false,
                supressErrors: false
            },
            JAR;

        /**
         * @namespace JAR
         * 
         * @borrows LoaderManager.register as register
         * @borrows LoaderManager.getDependencyURLList as getDependencyURLList
         */
        JAR = {
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @param {Function():undefined} main
             * @param {Function(string):undefined} onAbort
             */
            main: function(main, onAbort) {
                var System = LoaderManager.getSystem(),
                    Logger = LoaderManager.getModuleRef('System.Logger'),
                    root = LoaderManager.getRoot();

                if (System.isFunction(main)) {
                    if (moduleNamesQueue.length) {
                        LoaderManager.$importLazy(moduleNamesQueue, onImport, System.isFunction(onAbort) ? onAbort : globalErrback);
                    }
                    else {
                        onImport();
                    }
                }
                else {
                    Logger.error('No main function provided');
                }

                moduleNamesQueue.length = 0;

                function onImport() {
                    if (configs.supressErrors) {
                        try {
                            Logger.log('start executing main...');
                            main.apply(root, arguments);
                        }
                        catch (e) {
                            Logger.error((e.stack || e.message || '\n\tError in JavaScript-code: ' + e) + '\nexiting...');
                        }
                        finally {
                            Logger.log('...done executing main');
                        }
                    }
                    else {
                        main.apply(root, arguments);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @param {(String|Object|Array)} moduleData
             */
            $import: function(moduleData) {
                moduleNamesQueue = moduleNamesQueue.concat(LoaderManager.Resolver.isRootName(moduleData) ? configs.bundle : moduleData);
            },
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @param {String} moduleName
             * @param {(Array|Function)} bundle
             * @param {Function|Undefined} factory
             */
            $export: function(moduleName, bundle, factory) {
                var System = LoaderManager.getSystem(),
                    resolvedModules = LoaderManager.Resolver.resolve(moduleNamesQueue, moduleName);

                if (System.isFunction(bundle)) {
                    factory = bundle;
                    bundle = undef;
                }

                moduleNamesQueue.length = 0;

                LoaderManager.register({
                    MID: moduleName,
                    deps: resolvedModules,
                    bundle: bundle
                }, function() {
                    var modules = {},
                        index = 0,
                        modulesCount = resolvedModules.length;

                    for (; index < modulesCount; index++) {
                        modules[index] = modules[resolvedModules[index]] = arguments[index];
                    }

                    return factory.call(this, modules);
                });
            },

            register: LoaderManager.register,

            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @param {(Object|String)} config
             * @param {(Function)} configurator
             */
            addConfigurator: function(config, configurator) {
                var System = LoaderManager.getSystem(),
                    option;

                if (System.isString(config) && !hasOwnProp(configurators, config) && System.isFunction(configurator)) {
                    configurators[config] = configurator;
                }
                else if (System.isObject(config)) {
                    for (option in config) {
                        hasOwnProp(config, option) && JAR.addConfigurator(option, config[option]);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @param {(Object|String)} config
             * @param {*} value
             */
            configure: function(config, value) {
                var System = LoaderManager.getSystem(),
                    option, configurator;

                if (System.isString(config)) {
                    configurator = configurators[config];

                    configs[config] = System.isFunction(configurator) ? configurator(value, configs[config], System) : value;
                }
                else if (System.isObject(config)) {
                    for (option in config) {
                        hasOwnProp(config, option) && JAR.configure(option, config[option]);
                    }
                }
            },

            getDependencyURLList: LoaderManager.getDependencyURLList,
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @param {String} context
             * 
             * @return {Boolean}
             */
            flush: function(context) {
                var flushed = LoaderManager.flush(context);

                exposeModulesGlobal(configs.globalAccess);

                return flushed;
            },
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @return {Object}
             */
            noConflict: function() {
                global.JAR = previousJAR;

                return JAR;
            },
            /**
             * @access public
             * 
             * @memberof JAR
             * 
             * @type {String}
             */
            version: '0.3.0'
        };

        /**
         * @access private
         * 
         * @memberof JAR
         * @inner
         * 
         * @param {String} abortedModuleName
         */
        function globalErrback(abortedModuleName) {
            LoaderManager.getModuleRef('System.Logger').error('Import of "' + abortedModuleName + '" failed!');
        }

        /**
         * @access private
         * 
         * @memberof JAR
         * @inner
         * 
         * @param {Boolean} expose
         */
        function exposeModulesGlobal(expose) {
            if (expose) {
                JAR.mods = LoaderManager.getRoot();
            }
        }

        /**
         * @access private
         * 
         * @memberof JAR
         * @inner
         */
        function bootstrapJAR() {
            var baseUrl = './',
                scripts = SourceManager.getScripts(),
                scriptCount = scripts.length - 1,
                bootstrapConfig = global.jarconfig || {},
                bootstrapModules = bootstrapConfig.modules,
                mainScript;

            for (; scriptCount > -1; scriptCount--) {
                mainScript = scripts[scriptCount].getAttribute('data-main');

                if (mainScript) {
                    baseUrl = mainScript.substring(0, mainScript.lastIndexOf('/')) || baseUrl;
                    break;
                }
            }

            if (mainScript && !bootstrapConfig.main) {
                bootstrapConfig.main = mainScript;
            }

            if (!LoaderManager.getSystem().isArray(bootstrapModules)) {
                bootstrapModules = bootstrapConfig.modules = bootstrapModules ? [bootstrapModules] : [];
            }

            bootstrapModules.unshift({
                baseUrl: baseUrl,

                cache: true,

                minified: false,

                versionSuffix: null,

                timeout: 5
            });

            JAR.configure(bootstrapConfig);
        }

        JAR.addConfigurator({
            debugging: function(debugConfig, oldDebugConfig, System) {
                if (!System.isObject(debugConfig)) {
                    debugConfig = {
                        debug: debugConfig
                    };
                }

                JAR.configure('modules', {
                    restrict: 'System.Logger',

                    config: debugConfig
                });
            },
            /**
             * @param {Boolean} makeGlobal
             * @param {Boolean} isGlobal
             * 
             * @return {Boolean}
             */
            globalAccess: function(makeGlobal, isGlobal) {
                if (makeGlobal) {
                    exposeModulesGlobal(!isGlobal);
                }
                else {
                    delete JAR.mods;
                }

                return !!makeGlobal;
            },
            /**
             * @param {String} mainScript
             * @param {String} oldMainScript
             * 
             * @return {String}
             */
            main: function(mainScript, oldMainScript) {
                return oldMainScript || (mainScript && SourceManager.addScript('main', mainScript + '.js'));
            },
            /**
             * @param {Object} environments
             * @param {Object} oldEnvironments
             * 
             * @return {Object<string, function>}
             */
            environments: function(newEnvironments, oldEnvironments) {
                var environment;

                for (environment in newEnvironments) {
                    if (hasOwnProp(newEnvironments, environment)) {
                        oldEnvironments[environment] = newEnvironments[environment];
                    }
                }

                return oldEnvironments;
            },
            /**
             * @param {String} environment
             * @param {String} oldEnvironment
             * 
             * @return {String}
             */
            environment: function(newEnvironment, oldEnvironment, System) {
                var environment = configs.environments[newEnvironment];

                if (newEnvironment !== oldEnvironment && System.isObject(environment)) {
                    JAR.configure(environment);
                }

                return newEnvironment;
            },
            /**
             * @param {(Object|Array)} newModuleConfigs
             * 
             * @return {Object}
             */
            modules: function(newModuleConfigs) {
                return ConfigurationManager.setModuleConfig(newModuleConfigs);
            },

            context: function(newContext, oldContext) {
                if (newContext !== oldContext) {
                    newContext = LoaderManager.setContext(newContext);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newContext;
            },
            /**
             * @param {Object} loaderConfig
             * 
             * @return {Object}
             */
            loader: function(loaderConfig) {
                return ConfigurationManager.setLoaderConfig(loaderConfig);
            },
            /**
             * @param {Object} newInterceptors
             * @param {Object} oldInterceptors
             * @param {Object} System
             * 
             * @return {Object}
             */
            interceptors: function(newInterceptors, oldInterceptors, System) {
                var interceptorType;

                if (System.isObject(newInterceptors)) {
                    for (interceptorType in newInterceptors) {
                        if (hasOwnProp(newInterceptors, interceptorType)) {
                            oldInterceptors = LoaderManager.addInterceptor(interceptorType, newInterceptors[interceptorType]);
                        }
                    }
                }

                return oldInterceptors;
            }
        });

        /*defaultConfig.environments = {
            production: {
                modules: {
                    minified: true
                },

                debugging: true,

                globalAccess: false
            },

            development: {
                modules: {
                    minified: false
                },

                debugging: true,

                globalAccess: true
            }
        };*/

        bootstrapJAR();

        return JAR;
    })();

})(this);