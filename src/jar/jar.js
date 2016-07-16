(function globalSetup(global, undef) {
    'use strict';

    var SourceManager, LoaderManager, hasOwnProp, concatString;

    hasOwnProp = (function hasOwnPropSetup() {
        var hasOwn = ({}).hasOwnProperty;

        /**
         * @access private
         *
         * @function
         * @memberof JAR
         * @inner
         *
         * @param {Object} object
         * @param {String} prop
         *
         * @return {Boolean}
         */
        return function hasOwnProp(object, prop) {
            return hasOwn.call(object, prop);
        };
    })();

    concatString = (function concatStringSetup() {
        var join = [].join,
            SPACE = ' ';

        /**
         * @access private
         *
         * @function
         * @memberof JAR
         * @inner
         *
         * @param {...String} string
         *
         * @return {String}
         */
        return function concatString() {
            return join.call(arguments, SPACE);
        };
    })();

    /**
     * @access private
     *
     * @memberof JAR
     * @inner
     *
     * @param {Object} object
     * @param {Function()} callback
     */
    function objectEach(object, callback) {
        var property;

        for (property in object) {
            if (hasOwnProp(object, property)) {
                if (callback(object[property], property)) {
                    break;
                }
            }
        }
    }

    /**
     * @access private
     *
     * @memberof JAR
     * @inner
     *
     * @param {Object} dest
     * @param {Object} source
     *
     * @return {Object}
     */
    function objectMerge(dest, source) {
        objectEach(source, function mergeValue(value, key) {
            dest[key] = value;
        });

        return dest;
    }

    /**
     * @access private
     *
     * @memberof JAR
     * @inner
     *
     * @param {(Array|NodeList)} array
     * @param {Function()} callback
     */
    function arrayEach(array, callback) {
        var index = 0,
            length = array.length;

        for (; index < length; index++) {
            if (callback(array[index], index)) {
                break;
            }
        }
    }

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
            scripts = {};

        return {
            /**
             * @access public
             *
             * @memberof JAR~SourceManager
             *
             * @return {String}
             */
            getMain: function() {
                var main;

                arrayEach(doc.getElementsByTagName('script'), function findMainScript(script) {
                    main = script.getAttribute('data-main');

                    return !!main;
                });

                return main;
            },
            /**
             * @access public
             *
             * @memberof JAR~SourceManager
             *
             * @param {String} moduleName
             * @param {String} path
             */
            loadSource: function(moduleName, path) {
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
            findSource: function(moduleName) {
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
            removeSource: function(moduleName) {
                var script = scripts[moduleName],
                    path = script.src;

                head.removeChild(script);

                delete scripts[moduleName];

                return path;
            }
        };
    })();

    LoaderManager = (function loaderManagerSetup() {
        var loaders = {},
            loaderCoreModules = {},
            interceptors = {},
            Resolver, Loader, LoaderManager;

        Resolver = (function resolverSetup() {
            var ROOT_MODULE_NAME = '*',
                BUNDLE_SUFFIX = '.*',
                RESOLVE_DEPS = 0,
                RESOLVE_BUNDLE = 1,
                RESOLVE_NESTED = 2,
                DEFAULT_RESOLVER_ERROR_MESSAGE = 'Could not resolve "${0}" relative to "${1}":',
                MUST_NOT_START_WITH_DOT = 'a bundle modulename must not start with a "."',
                DOT = '.',
                SLASH = '/',
                VERSION_DELIMITER = '@',
                RE_VERSION_WITHOUT_PATCH = /(\d+\.\d+\.)\d+.+/,
                RE_END_SLASH = /\/$/,
                RE_BUNDLE_REQUEST = /\.\*$/,
                RE_LEADING_DOT = /^\./,
                interceptorInfoCache = {},
                resolverErrorTemplates = [],
                resolverLoggerOptions = {
                    tpl: resolverErrorTemplates
                },
                Resolver;

            resolverErrorTemplates[RESOLVE_DEPS] = concatString(DEFAULT_RESOLVER_ERROR_MESSAGE, 'a dependency modulename must be absolute or relative to the current module.');
            resolverErrorTemplates[RESOLVE_BUNDLE] = concatString(DEFAULT_RESOLVER_ERROR_MESSAGE, MUST_NOT_START_WITH_DOT, '.');
            resolverErrorTemplates[RESOLVE_NESTED] = concatString(DEFAULT_RESOLVER_ERROR_MESSAGE, MUST_NOT_START_WITH_DOT, 'or only contain it as a special symbol.');

            /**
             * @access private
             *
             * @memberof JAR~LoaderManager~Resolver
             * @inner
             *
             * @param {String} moduleName
             *
             * @return {Boolean}
             */
            function resolverIsRelativeModuleName(moduleName) {
                return RE_LEADING_DOT.test(moduleName);
            }

            /**
             * @access private
             *
             * @namespace Resolver
             *
             * @memberof JAR~LoaderManager
             * @inner
             */
            Resolver = {
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {Boolean}
                 */
                isRootName: function(moduleName) {
                    return ROOT_MODULE_NAME === moduleName;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @return {String}
                 */
                getRootName: function() {
                    return ROOT_MODULE_NAME;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {Object}
                 */
                getPathOptions: function(moduleName) {
                    var options = {},
                        versionParts = moduleName.split(VERSION_DELIMITER),
                        pathParts = versionParts[0].split(DOT),
                        fileName = options.fileName = pathParts.pop(),
                        firstLetterFileName = fileName.charAt(0);

                    versionParts[1] && (options.versionDir = Resolver.ensureEndsWithSlash(versionParts[1]));

                    if (firstLetterFileName === firstLetterFileName.toLowerCase()) {
                        pathParts.push(fileName);
                    }

                    options.dirPath = pathParts.length ? (pathParts.join(SLASH) + SLASH) : '';

                    return options;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} path
                 *
                 * @return {String}
                 */
                ensureEndsWithSlash: function(path) {
                    return (!path || RE_END_SLASH.test(path)) ? path : path + SLASH;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {String}
                 */
                getBundleName: function(moduleName) {
                    return moduleName + BUNDLE_SUFFIX;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {String}
                 */
                getImplicitDependencyName: function(moduleName) {
                    var versionParts = moduleName.split(VERSION_DELIMITER),
                        version = versionParts[1];

                    moduleName = versionParts[0];
                    moduleName = moduleName.substr(0, moduleName.lastIndexOf(DOT));

                    versionParts[0] = moduleName;

                    version && (version = version.replace(RE_VERSION_WITHOUT_PATCH, '$10'));

                    return Resolver.appendVersion(moduleName, version);
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {Boolean}
                 */
                isVersionedModule: function(moduleName) {
                    return moduleName.indexOf(VERSION_DELIMITER) > -1;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 * @param {String} version
                 *
                 * @return {String}
                 */
                appendVersion: function(moduleName, version) {
                    return (moduleName && version) ? [moduleName, version].join(VERSION_DELIMITER) : moduleName;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {String}
                 */
                extractModuleNameFromBundle: function(moduleName) {
                    return moduleName.replace(RE_BUNDLE_REQUEST, '');
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {Boolean}
                 */
                isBundleRequest: function(moduleName) {
                    return RE_BUNDLE_REQUEST.test(moduleName);
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {String} moduleName
                 *
                 * @return {Array}
                 */
                extractInterceptorInfo: function(moduleName) {
                    var interceptorInfo = interceptorInfoCache[moduleName],
                        moduleParts;

                    if (!interceptorInfo) {
                        objectEach(interceptors, function findInterceptor(interceptor, interceptorType) {
                            if (moduleName.indexOf(interceptorType) > -1) {
                                moduleParts = moduleName.split(interceptorType);

                                interceptorInfo = {
                                    moduleName: moduleParts.shift(),

                                    type: interceptorType,

                                    data: moduleParts.join(interceptorType)
                                };

                                return true;
                            }
                        });

                        interceptorInfo = interceptorInfoCache[moduleName] = interceptorInfo || {
                            moduleName: moduleName
                        };
                    }

                    return interceptorInfo;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {Array} modules
                 * @param {String} referenceModuleName
                 * @param {Number} resolveType
                 *
                 * @return {Array<string>}
                 */
                resolveArray: function(modules, referenceModuleName, resolveType) {
                    var resolvedModules = [];

                    arrayEach(modules, function concatResolvedModules(moduleName) {
                        resolvedModules = resolvedModules.concat(Resolver.resolve(moduleName, referenceModuleName, resolveType));
                    });

                    return resolvedModules;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
                 *
                 * @param {Object} modules
                 * @param {String} referenceModuleName
                 * @param {Number} resolveType
                 *
                 * @return {Array<string>}
                 */
                resolveObject: function(modules, referenceModuleName, resolveType) {
                    var resolvedModules = [];

                    objectEach(modules, function concatResolvedModules(module, tmpReferenceModuleName) {
                        resolvedModules = resolvedModules.concat(Resolver.resolve(module, tmpReferenceModuleName, RESOLVE_NESTED));
                    });

                    return Resolver.resolveArray(resolvedModules, referenceModuleName, resolveType);
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
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
                        refParts = referenceModuleName.split(DOT);

                        if (resolveType === RESOLVE_NESTED && !isValidModuleName && moduleName === DOT) {
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
                        Logger = LoaderManager.getLogger();
                        Logger.errorWithContext('Resolver', resolveType, [origModuleName, referenceModuleName], resolverLoggerOptions);
                    }

                    return resolvedModules;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
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

                    return refParts.join(DOT) + interceptorData;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Resolver
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
                 * @memberof JAR~LoaderManager~Resolver
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

        Loader = (function loaderSetup() {
            var Interception, Config, Module;

            Interception = (function interceptionSetup() {
                /**
                 * @access private
                 *
                 * @constructor Interception
                 *
                 * @memberof JAR~LoaderManager~Loader
                 * @inner
                 *
                 * @param {String} dependency
                 * @param {String} listener
                 * @param {JAR~LoaderManager~Loader~Module~successCallback} callback
                 * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
                 */
                function Interception(dependency, listener, callback, errback) {
                    var interception = this,
                        interceptorInfo = Resolver.extractInterceptorInfo(dependency);

                    interception.listener = listener;
                    interception.data = interceptorInfo.data;
                    interception.dependency = dependency;
                    interception._callback = callback;
                    interception._errback = errback;
                }

                Interception.prototype = {
                    /**
                     * @access public
                     *
                     * @alias JAR~LoaderManager~Loader~Interception
                     *
                     * @memberof JAR~LoaderManager~Loader~Interception#
                     */
                    constructor: Interception,
                    /**
                     * @access public
                     *
                     * @param {String} fileType
                     *
                     * @return {String}
                     *
                     * @memberof JAR~LoaderManager~Loader~Interception#
                     */
                    getFilePath: function(fileType) {
                        return !Resolver.isRootName(this.listener) && LoaderManager.loader.getModule(this.listener).getFullPath(fileType);
                    },
                    /**
                     * @access public
                     *
                     * @param {Array} moduleNames
                     * @param {Function()} callback
                     * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
                     * @param {Function()} progressback
                     *
                     * @memberof JAR~LoaderManager~Loader~Interception#
                     */
                    $import: function(moduleNames, callback, errback, progressback) {
                        LoaderManager.$importLazy(moduleNames, callback, errback, progressback);
                    },
                    /**
                     * @access public
                     *
                     * @param {Array} moduleNames
                     * @param {Function()} callback
                     * @param {JAR~LoaderManager~Loader~Module~failCallback} [errback]
                     * @param {Function()} [progressback]
                     *
                     * @memberof JAR~LoaderManager~Loader~Interception#
                     */
                    $importAndLink: function(moduleNames, callback, errback, progressback) {
                        var interceptorDeps;

                        moduleNames = Resolver.resolve(moduleNames, this.dependency);

                        if (!Resolver.isRootName(this.listener)) {
                            interceptorDeps = LoaderManager.loader.getModule(this.listener).interceptorDeps;
                            interceptorDeps.push.apply(interceptorDeps, moduleNames);
                        }

                        LoaderManager.$importLazy(moduleNames, callback, errback, progressback);
                    },
                    /**
                     * @access public
                     *
                     * @param {*} data
                     *
                     * @memberof JAR~LoaderManager~Loader~Interception#
                     */
                    success: function(data) {
                        this._callback(this.dependency, data);
                    },
                    /**
                     * @access public
                     *
                     * @param {String} error
                     *
                     * @memberof JAR~LoaderManager~Loader~Interception#
                     */
                    fail: function(error) {
                        LoaderManager.loader.getModule(this.dependency).logInterceptionError({
                            type: Resolver.extractInterceptorInfo(this.dependency).type,

                            data: this.data
                        }, error);

                        this._errback(this.dependency);
                    }
                };

                return Interception;
            })();

            Config = (function configurationSetup() {
                var MIN_TIMEOUT = 0.5,
                    STRING_CHECK = 'String',
                    OBJECT_CHECK = 'Object',
                    BOOLEAN_CHECK = 'Boolean',
                    definitions;

                definitions = {
                    baseUrl: {
                        check: STRING_CHECK,

                        transform: Resolver.ensureEndsWithSlash
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

                    checkCircularDeps: {
                        check: BOOLEAN_CHECK
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
                            return objectMerge(LoaderManager.loader.getModule(moduleName).getConfig('config', Resolver.isBundleRequest(moduleName)), config);
                        }
                    },

                    dirPath: {
                        check: STRING_CHECK,

                        transform: Resolver.ensureEndsWithSlash
                    },

                    fileName: {
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
                            // create a copy of the recover-config
                            // because it should update for every module independendly
                            var recover = objectMerge({}, recoverConfig);

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
                            return (timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT) * 1000;
                        }
                    },

                    versionDir: {
                        check: STRING_CHECK,

                        transform: Resolver.ensureEndsWithSlash
                    }
                };
                /**
                 * @access private
                 *
                 * @constructor Config
                 *
                 * @memberof JAR~LoaderManager~Loader
                 * @inner
                 *
                 * @param {String} moduleName
                 */
                function Config(moduleName) {
                    this.moduleName = moduleName;
                    this.children = {};
                    this.config = {};
                }

                Config.prototype = {
                    /**
                     * @access public
                     *
                     * @alias JAR~LoaderManager~Loader~Config
                     *
                     * @memberof JAR~LoaderManager~Loader~Config#
                     */
                    constructor: Config,
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Config#
                     *
                     * @param {Object} newConfig
                     *
                     * @return {Object}
                     */
                    update: function(newConfig) {
                        var config = this,
                            System = LoaderManager.getSystem();

                        objectEach(newConfig, function updateConfig(value, option) {
                            var transform, definition;

                            if (hasOwnProp(definitions, option)) {
                                definition = definitions[option];
                                transform = definition.transform;

                                if (System.isFunction(value)) {
                                    value = value(config[option], config.moduleName);
                                }

                                if (System['is' + definition.check](value)) {
                                    config[option] = transform ? transform(value, config.moduleName) : value;
                                }
                                else if (System.isNull(value)) {
                                    delete config[option];
                                }
                            }
                        });

                        return config;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Config#
                     *
                     * @param {String} moduleName
                     *
                     * @return {JAR~LoaderManager~Loader~Config}
                     */
                    child: function(moduleName) {
                        var childConfig = this.children[moduleName];

                        if (!childConfig) {
                            childConfig = this.children[moduleName] = createChildConfig(this);
                            childConfig.moduleName = moduleName;
                            childConfig.config = createChildConfig(this.config);
                        }

                        return childConfig;
                    }
                };

                /**
                 * @access private
                 *
                 * @memberof JAR~LoaderManager~Loader~Config
                 * @inner
                 */
                function ChildConfig() {}

                function createChildConfig(parentConfig) {
                    ChildConfig.prototype = parentConfig;

                    return new ChildConfig();
                }

                return Config;
            })();

            Module = (function moduleSetup() {
                var SEPERATOR = '", "',
                    QUEUE_SUCCESS = 0,
                    QUEUE_ERROR = 1,

                    // Loader message indices
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_ABORTED = 0,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_ALREADY_LOADED = 1,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_ALREADY_LOADING = 2,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_FOUND = 3,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_LOADED = 4,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_LOADING = 5,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_NOT_DEFINED = 6,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_NOTIFIED = 7,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_REQUESTED = 8,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_BUNDLE_SUBSCRIBED = 9,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_CIRCULAR_DEPENDENCIES_FOUND = 10,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_DEPENDENCIES_FOUND = 11,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_DEPENDENCY_FOUND = 12,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_INTERCEPTION_ERROR = 13,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_ALREADY_LOADED = 14,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_ALREADY_LOADED_MANUAL = 15,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_ALREADY_LOADING = 16,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_ALREADY_REGISTERED = 17,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_LOADED = 18,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_LOADED_MANUAL = 19,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_LOADING = 20,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_NOTIFIED = 21,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_RECOVERING = 22,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_REGISTERING = 23,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_REQUESTED = 24,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_SUBSCRIBED = 25,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MSG_MODULE_TIMEOUT = 26,

                    // Module states
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_WAITING = 1,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_LOADING = 2,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_LOADED = 3,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_REGISTERED = 4,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_LOADED_MANUAL = 5,

                    // Bundle states
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_BUNDLE_WAITING = 0,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_BUNDLE_LOADING = 1,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_BUNDLE_REQUESTED = 2,
                    /**
                     * @access private
                     *
                     * @constant
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module
                     * @inner
                     */
                    MODULE_BUNDLE_LOADED = 3;

                /**
                 * @callback successCallback
                 *
                 * @memberof JAR~LoaderManager~Loader~Module
                 * @inner
                 *
                 * @param {String} moduleName
                 * @param {*} data
                 */

                /**
                 * @callback failCallback
                 *
                 * @memberof JAR~LoaderManager~Loader~Module
                 * @inner
                 *
                 * @param {String} moduleName
                 */

                /**
                 * @callback factoryCallback
                 *
                 * @memberof JAR~LoaderManager~Loader~Module
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
                 * @memberof JAR~LoaderManager~Loader
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

                    module.dep = Resolver.getImplicitDependencyName(moduleName);
                    module.deps = [];
                    module.bundle = [];

                    module.depsQueue = [];
                    module.bundleQueue = [];

                    module.state = MODULE_WAITING;
                    module.bundleState = MODULE_BUNDLE_WAITING;

                    module.interceptorData = {};
                    module.interceptorDeps = [];

                    module.initConfig();
                }

                Module.prototype = {
                    /**
                     * @access public
                     *
                     * @alias JAR~LoaderManager~Loader~Module
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    constructor: Module,
                    /**
                     * @access public
                     *
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    depsCounter: 0,
                    /**
                     * @access public
                     *
                     * @type {Number}
                     * @default
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    bundleCounter: 0,
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    initConfig: function() {
                        var module = this,
                            loader = module.loader,
                            implicitDependency = module.dep;

                        module.bundleConfig = (implicitDependency ? loader.getModule(implicitDependency).bundleConfig : loader.rootConfig).child(module.bundleName);
                        module.config = module.bundleConfig.child(module.name);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Number} state
                     * @param {Boolean} [checkBundleState]
                     *
                     * @return {Boolean}
                     */
                    isState: function(state, checkBundleState) {
                        return this[checkBundleState ? 'bundleState' : 'state'] === state;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Number} state
                     * @param {Boolean} [setBundleState]
                     */
                    setState: function(state, setBundleState) {
                        this[setBundleState ? 'bundleState' : 'state'] = state;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Boolean} [logState]
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @return {Boolean}
                     */
                    isLoading: function() {
                        return this.isState(MODULE_LOADING);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @return {Boolean}
                     */
                    isLoaded: function() {
                        return this.isState(MODULE_LOADED);
                    },
                    /**
                     * @access public
                     *
                     * @function
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Number} messageType
                     * @param {Boolean} logBundle
                     * @param {Object} values
                     */
                    log: (function moduleLogMessageSetup() {
                        var messageTemplates = [],
                            messageTypes = {},
                            MODULE = 'module',
                            BUNDLE = 'bundle',
                            LOADING = 'loading',
                            LOADED = 'loaded',
                            MANUAL = 'manual',
                            REQUESTED = 'requested',
                            START_LOAD = concatString('started', LOADING),
                            END_LOAD = concatString('finished', LOADING),
                            FOUND = 'found',
                            SUBSCRIBED_TO = 'subscribed to "${subs}"',
                            NOTIFIED_BY = 'was notified by "${pub}"',
                            ATTEMPTED_TO = 'attempted to',
                            ATTEMPTED_TO_LOAD = concatString(ATTEMPTED_TO, 'load'),
                            BUT_ALREADY = 'but is already',
                            BUT_ALREADY_LOADING = concatString(BUT_ALREADY, LOADING),
                            BUT_ALREADY_LOADED = concatString(BUT_ALREADY, LOADED),
                            ATTEMPTED_TO_LOAD_MODULE = concatString(ATTEMPTED_TO_LOAD, MODULE),
                            ATTEMPTED_TO_LOAD_BUNDLE = concatString(ATTEMPTED_TO_LOAD, BUNDLE),
                            ABORTED_LOADING = concatString('aborted', LOADING),
                            loggerOptions;

                        /**
                         * @access private
                         *
                         * @param {Array<number>} messages
                         * @param {String} logLevel
                         */
                        function setLogLevelForMessageTypes(messages, logLevel) {
                            arrayEach(messages, function setLogLevelForMessageType(message) {
                                messageTypes[message] = logLevel;
                            });
                        }

                        setLogLevelForMessageTypes([
                        MSG_BUNDLE_FOUND,
                        MSG_BUNDLE_LOADED,
                        MSG_BUNDLE_LOADING,
                        MSG_BUNDLE_NOTIFIED,
                        MSG_BUNDLE_REQUESTED,
                        MSG_BUNDLE_SUBSCRIBED,
                        MSG_DEPENDENCIES_FOUND,
                        MSG_DEPENDENCY_FOUND,
                        MSG_MODULE_LOADED,
                        MSG_MODULE_LOADED_MANUAL,
                        MSG_MODULE_LOADING,
                        MSG_MODULE_NOTIFIED,
                        MSG_MODULE_REGISTERING,
                        MSG_MODULE_REQUESTED,
                        MSG_MODULE_SUBSCRIBED], 'debug');

                        setLogLevelForMessageTypes([
                        MSG_BUNDLE_ALREADY_LOADED,
                        MSG_BUNDLE_ALREADY_LOADING,
                        MSG_MODULE_ALREADY_LOADED,
                        MSG_MODULE_ALREADY_LOADING], 'info');

                        setLogLevelForMessageTypes([
                        MSG_BUNDLE_NOT_DEFINED,
                        MSG_MODULE_ALREADY_LOADED_MANUAL,
                        MSG_MODULE_ALREADY_REGISTERED,
                        MSG_MODULE_RECOVERING], 'warn');

                        setLogLevelForMessageTypes([
                        MSG_BUNDLE_ABORTED,
                        MSG_CIRCULAR_DEPENDENCIES_FOUND,
                        MSG_INTERCEPTION_ERROR,
                        MSG_MODULE_TIMEOUT], 'error');

                        messageTemplates[MSG_BUNDLE_ABORTED] = concatString(ABORTED_LOADING, BUNDLE);
                        messageTemplates[MSG_BUNDLE_ALREADY_LOADED] = concatString(ATTEMPTED_TO_LOAD_BUNDLE, BUT_ALREADY_LOADED);
                        messageTemplates[MSG_BUNDLE_ALREADY_LOADING] = concatString(ATTEMPTED_TO_LOAD_BUNDLE, BUT_ALREADY_LOADING);
                        messageTemplates[MSG_BUNDLE_FOUND] = concatString(FOUND, 'bundlemodules "${bundle}" for', BUNDLE);
                        messageTemplates[MSG_BUNDLE_LOADED] = concatString(END_LOAD, BUNDLE);
                        messageTemplates[MSG_BUNDLE_LOADING] = concatString(START_LOAD, BUNDLE);
                        messageTemplates[MSG_BUNDLE_NOT_DEFINED] = concatString(ATTEMPTED_TO_LOAD_BUNDLE, 'but', BUNDLE, 'is not defined');
                        messageTemplates[MSG_BUNDLE_NOTIFIED] = concatString(BUNDLE, NOTIFIED_BY);
                        messageTemplates[MSG_BUNDLE_REQUESTED] = concatString(BUNDLE, REQUESTED);
                        messageTemplates[MSG_BUNDLE_SUBSCRIBED] = concatString(BUNDLE, SUBSCRIBED_TO);

                        messageTemplates[MSG_CIRCULAR_DEPENDENCIES_FOUND] = concatString(FOUND, 'circular dependencies "${deps}" for', MODULE);

                        messageTemplates[MSG_DEPENDENCIES_FOUND] = concatString(FOUND, 'explicit dependencie(s) "${deps}" for', MODULE);
                        messageTemplates[MSG_DEPENDENCY_FOUND] = concatString(FOUND, 'implicit dependency "${dep}" for', MODULE);

                        messageTemplates[MSG_INTERCEPTION_ERROR] = concatString('error in interception of this', MODULE, 'by interceptor "${type}" with data "${data}"');

                        messageTemplates[MSG_MODULE_ALREADY_LOADED] = concatString(ATTEMPTED_TO_LOAD_MODULE, BUT_ALREADY_LOADED);
                        messageTemplates[MSG_MODULE_ALREADY_LOADED_MANUAL] = concatString(ATTEMPTED_TO_LOAD_MODULE, BUT_ALREADY_LOADED, MANUAL);
                        messageTemplates[MSG_MODULE_ALREADY_LOADING] = concatString(ATTEMPTED_TO_LOAD_MODULE, BUT_ALREADY_LOADING);

                        messageTemplates[MSG_MODULE_ALREADY_REGISTERED] = concatString(ATTEMPTED_TO, 'register', MODULE, BUT_ALREADY, 'registered');

                        messageTemplates[MSG_MODULE_LOADED] = concatString(END_LOAD, MODULE);
                        messageTemplates[MSG_MODULE_LOADED_MANUAL] = concatString(MODULE, 'was', LOADED, MANUAL);
                        messageTemplates[MSG_MODULE_LOADING] = concatString(START_LOAD, MODULE, 'from path "${path}"');

                        messageTemplates[MSG_MODULE_NOTIFIED] = concatString(MODULE, NOTIFIED_BY);
                        messageTemplates[MSG_MODULE_RECOVERING] = concatString(MODULE, 'failed to load and tries to recover...');
                        messageTemplates[MSG_MODULE_REGISTERING] = concatString(MODULE, 'registering...');
                        messageTemplates[MSG_MODULE_REQUESTED] = concatString(MODULE, REQUESTED);
                        messageTemplates[MSG_MODULE_SUBSCRIBED] = concatString(MODULE, SUBSCRIBED_TO);

                        messageTemplates[MSG_MODULE_TIMEOUT] = concatString(ABORTED_LOADING, MODULE, 'after ${sec} second(s) - file may not be available on path "${path}"');

                        loggerOptions = {
                            tpl: messageTemplates
                        };

                        function moduleLogMessage(messageType, logBundle, values) {
                            /*jslint validthis: true */
                            var module = this,
                                moduleName = module.getName(logBundle),
                                context = (logBundle ? 'Bundle' : 'Module') + ':' + moduleName,
                                Logger = module.loader.getLogger(),
                                level = messageTypes[messageType] || 'error';

                            if (Logger) {
                                Logger[level + 'WithContext'](context, messageType, values, loggerOptions);
                            }
                        }

                        return moduleLogMessage;
                    })(),
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @return {Boolean}
                     */
                    checkForCircularDeps: function() {
                        var module = this,
                            hasCircularDependency = false,
                            circularDependencies;

                        if (module.getConfig('checkCircularDeps')) {
                            circularDependencies = module.findCircularDeps();
                            hasCircularDependency = !! circularDependencies.length;

                            if (hasCircularDependency) {
                                module.log(MSG_CIRCULAR_DEPENDENCIES_FOUND, false, {
                                    deps: circularDependencies.join(SEPERATOR)
                                });
                            }
                        }

                        return hasCircularDependency;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Object} [traversedModules]
                     *
                     * @return {Array}
                     */
                    findCircularDeps: function(traversedModules) {
                        var module = this,
                            moduleName = module.name,
                            dependencies = module.getAllDeps(),
                            circularDependencies = [];

                        traversedModules = traversedModules || {};

                        if (hasOwnProp(traversedModules, moduleName)) {
                            circularDependencies = [moduleName];
                        }
                        else {
                            traversedModules[moduleName] = true;

                            arrayEach(dependencies, function findCircularDeps(dependencyName) {
                                circularDependencies = module.loader.getModule(dependencyName).findCircularDeps(traversedModules);

                                if (circularDependencies.length) {
                                    circularDependencies.unshift(moduleName);

                                    return true;
                                }
                            });

                            delete traversedModules[moduleName];
                        }

                        return circularDependencies;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {String} fileType
                     *
                     * @return {String}
                     */
                    getFileName: function(fileType) {
                        var module = this,
                            cache = module.getConfig('cache') ? '' : '?_=' + new Date().getTime();

                        return [module.getConfig('fileName'), module.getConfig('minified'), '.', fileType, cache].join('');
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @return {String}
                     */
                    getPath: function() {
                        var module = this;

                        return [module.getConfig('baseUrl'), module.getConfig('dirPath'), module.getConfig('versionDir')].join('');
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {String} option
                     * @param {String} [skipUntil]
                     *
                     * @return {*}
                     */
                    getConfig: function(option, skipUntil) {
                        var module = this,
                            loader = module.loader,
                            defaultValue = module.options[option],
                            config = module.config,
                            result;

                        if (skipUntil && !hasOwnProp(config, option)) {
                            config = Resolver.isRootName(skipUntil) ? loader.rootConfig : loader.getModule(skipUntil).bundleConfig;
                        }

                        if (option in config) {
                            result = config[option];
                        }
                        else {
                            result = defaultValue;
                        }

                        return result;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    bundleLoaded: function() {
                        var module = this;

                        if (!module.isState(MODULE_BUNDLE_LOADED, true)) {
                            module.setState(MODULE_BUNDLE_LOADED, true);

                            module.log(module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED, true);

                            module.notify(true);
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Array<string>} moduleNames
                     * @param {Boolean} [asBundle]
                     */
                    listenFor: function(moduleNames, asBundle) {
                        var module = this,
                            loader = module.loader,
                            moduleCount = moduleNames.length,
                            System = loader.getSystem();

                        if (!module.setLoadedIfReady(moduleCount, asBundle) && moduleCount) {
                            module.log(asBundle ? MSG_BUNDLE_SUBSCRIBED : MSG_MODULE_SUBSCRIBED, asBundle, {
                                subs: moduleNames.join(SEPERATOR)
                            });

                            loader.listenFor(module.getName(asBundle), moduleNames, function onModuleLoaded(publishingModuleName, data) {
                                module.log(asBundle ? MSG_BUNDLE_NOTIFIED : MSG_MODULE_NOTIFIED, asBundle, {
                                    pub: publishingModuleName
                                });

                                if (!System.isNil(data)) {
                                    module.interceptorData[publishingModuleName] = data;
                                }

                                asBundle && module.isState(MODULE_BUNDLE_REQUESTED, asBundle) && module.listenForBundle();

                                module.setLoadedIfReady(-1, asBundle);
                            }, function onModuleAborted() {
                                module.abort(false, asBundle);
                            });
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Boolean} requestBundle
                     *
                     * @return {JAR~LoaderManager~Loader~Module}
                     */
                    request: function(requestBundle) {
                        var module = this,
                            isWaiting = module.isState(requestBundle ? MODULE_BUNDLE_WAITING : MODULE_WAITING, requestBundle);

                        module.log(requestBundle ? MSG_BUNDLE_REQUESTED : MSG_MODULE_REQUESTED, requestBundle);

                        if (isWaiting) {
                            module['load' + (requestBundle ? 'Bundle' : '')]();
                        }
                        else {
                            module.logRequestState(requestBundle);
                        }

                        return module;
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Boolean} requestBundle
                     */
                    logRequestState: function(requestBundle) {
                        var module = this,
                            isLoaded = module.isState(requestBundle ? MODULE_BUNDLE_LOADED : MODULE_LOADED, requestBundle),
                            loadedMsgID = requestBundle ? MSG_BUNDLE_ALREADY_LOADED : MSG_MODULE_ALREADY_LOADED,
                            loadingMsgID = requestBundle ? MSG_BUNDLE_ALREADY_LOADING : MSG_MODULE_ALREADY_LOADING;

                        module.log(isLoaded ? loadedMsgID : (!requestBundle && module.isState(MODULE_LOADED_MANUAL)) ? MSG_MODULE_ALREADY_LOADED_MANUAL : loadingMsgID, requestBundle);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    loadBundle: function() {
                        var module = this;

                        module.setState(MODULE_BUNDLE_REQUESTED, true);

                        module.listenFor([module.name], true);
                    },

                    listenForBundle: function() {
                        var module = this,
                            bundle = module.bundle;

                        if (bundle.length) {
                            module.log(MSG_BUNDLE_FOUND, true, {
                                bundle: bundle.join(SEPERATOR)
                            });

                            module.setState(MODULE_BUNDLE_LOADING, true);

                            module.log(MSG_BUNDLE_LOADING, true);

                            module.listenFor(bundle, true);
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {JAR~LoaderManager~Loader~Module~successCallback} callback
                     * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
                     * @param {Boolean} isBundleRequest
                     */
                    onLoad: function(callback, errback, isBundleRequest) {
                        var module = this;

                        if (!module.isState(MODULE_LOADED) || (isBundleRequest && !module.isState(MODULE_BUNDLE_LOADED, true))) {
                            module.enqueue(callback, errback, isBundleRequest);
                        }
                        else {
                            callback(module.getName(isBundleRequest));
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    load: function() {
                        var module = this,
                            path = module.getFullPath();

                        module.log(MSG_MODULE_LOADING, false, {
                            path: path
                        });

                        module.setState(MODULE_LOADING);

                        module.timeoutID = global.setTimeout(function abortModule() {
                            module.abort();
                        }, module.getConfig('timeout'));

                        SourceManager.loadSource(module.loader.context + ':' + module.name, path);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @return {Boolean}
                     */
                    findRecover: function() {
                        var module = this,
                            loader = module.loader,
                            moduleName = module.name,
                            nextRecover = module.nextRecover,
                            foundRecover = nextRecover === false ? nextRecover : module.getConfig('recover', nextRecover),
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

                            module.log(MSG_MODULE_RECOVERING);

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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Boolean} [silent]
                     * @param {Boolean} [abortBundle]
                     */
                    abort: function(silent, abortBundle) {
                        var module = this,
                            emptyQueue = false;

                        if (abortBundle) {
                            if (module.isState(MODULE_BUNDLE_LOADING, true)) {
                                module.log(MSG_BUNDLE_ABORTED, true);

                                module.setState(MODULE_BUNDLE_WAITING, true);
                                emptyQueue = true;
                            }
                        }
                        else if (module.isState(MODULE_LOADING)) {
                            if (!silent) {
                                module.setState(MODULE_WAITING);

                                if (!module.findRecover()) {
                                    emptyQueue = true;

                                    module.log(MSG_MODULE_TIMEOUT, false, {
                                        path: SourceManager.removeSource(module.loader.context + ':' + module.name),

                                        sec: module.getConfig('timeout')
                                    });
                                }
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
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {JAR~LoaderManager~Loader~Module~successCallback} callback
                     * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
                     * @param {Boolean} enqueueBundle
                     */
                    enqueue: function(callback, errback, enqueueBundle) {
                        this.getQueue(enqueueBundle).push([callback, errback]);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {(Object|Array|String)} dependencies
                     */
                    $import: function(dependencies) {
                        var module = this;

                        if (!module.isRegistered()) {
                            module.deps = module.deps.concat(Resolver.resolve(dependencies, module.name));
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {JAR~LoaderManager~Loader~Module~factoryCallback} factory
                     */
                    $export: function(factory) {
                        var module = this,
                            moduleState;

                        if (!module.isRegistered(true)) {
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

                            if (module.checkForCircularDeps()) {
                                module.abort();
                            }
                            else {
                                module.requestDeps();
                            }
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Array} bundle
                     */
                    defineBundle: function(bundle) {
                        var module = this;

                        if (module.isState(MODULE_BUNDLE_WAITING, true) || module.isState(MODULE_BUNDLE_REQUESTED, true)) {
                            module.bundle = Resolver.resolveBundle(bundle, module.name);
                        }
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     */
                    requestDeps: function() {
                        var module = this,
                            implicitDependency = module.dep,
                            dependencies = module.deps;

                        if (dependencies.length) {
                            module.log(MSG_DEPENDENCIES_FOUND, false, {
                                deps: dependencies.join(SEPERATOR)
                            });
                        }

                        if (implicitDependency) {
                            module.log(MSG_DEPENDENCY_FOUND, false, {
                                dep: implicitDependency
                            });

                            dependencies = module.getAllDeps();
                        }


                        module.listenFor(dependencies);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
                     *
                     * @param {Boolean} [notifyBundle]
                     */
                    notify: function(notifyBundle) {
                        this.dequeue(QUEUE_SUCCESS, notifyBundle);
                    },
                    /**
                     * @access public
                     *
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                     * @memberof JAR~LoaderManager~Loader~Module#
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
                            depRefs.push(!System.isNil(data) ? data : loader.getModule(dependencyName).ref);
                        });

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
                var loader = this,
                    rootName = Resolver.getRootName();

                loader.context = context;
                loader.currentModuleName = rootName;

                loader.rootConfig = new Config(rootName);
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

                    loader.resetModulesUrlList();

                    loader.registerCore();
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {Object} newConfig
                 */
                setModuleConfig: function(newConfig) {
                    var loader = this,
                        modules = newConfig.restrict ? Resolver.resolve(newConfig.restrict) : [Resolver.getRootName()];

                    arrayEach(modules, function updateModuleConfig(moduleName) {

                        if (Resolver.isRootName(moduleName)) {
                            loader.rootConfig.update(newConfig);
                        }
                        else {
                            loader.getModule(moduleName).updateConfig(newConfig, Resolver.isBundleRequest(moduleName));
                        }
                    });
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
                 * @return {Object}
                 */
                getCurrentModuleData: function() {
                    var loader = this,
                        moduleName = loader.currentModuleName,
                        module = loader.getModule(moduleName);

                    return {
                        moduleName: moduleName,

                        url: module.getFullPath()
                    };
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
                 * @return {Object}
                 */
                getLogger: function() {
                    return this.getModuleRef('System.Logger');
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
                 * @return {JAR~LoaderManager~Loader~Module}
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
                 * @return {JAR~LoaderManager~Loader~Module}
                 */
                createModule: function(moduleName) {
                    var loader = this;

                    return (loader.modules[moduleName] = new Module(loader, moduleName));
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {Function(JAR~LoaderManager~Loader~Module)} callback
                 */
                eachModules: function(callback) {
                    objectEach(this.modules, callback);
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 */
                registerCore: function() {
                    var loader = this,
                        module;

                    objectEach(loaderCoreModules, function registerCoreModule(coreModule, moduleName) {
                        var dependencies = coreModule[0].deps;

                        module = loader.registerModule(moduleName, coreModule[0].bundle);

                        dependencies && module.$import(dependencies);

                        module.$export(coreModule[1]);
                    });
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {String} moduleName
                 * @param {Array} bundle
                 */
                registerModule: function(moduleName, bundle) {
                    var module = this.getModule(moduleName);

                    bundle && module.defineBundle(bundle);

                    return {
                        $import: function(dependencies) {
                            module.$import(dependencies);

                            return this;
                        },

                        $export: function(factory) {
                            module.$export(factory);
                        }
                    };
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {String} listeningModuleName
                 * @param {Array<string>} moduleNames
                 * @param {JAR~LoaderManager~Loader~Module~successCallback} callback
                 * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
                 */
                listenFor: function(listeningModuleName, moduleNames, callback, errback) {
                    var loader = this;

                    arrayEach(moduleNames, function listenFor(moduleName) {
                        loader.$import(moduleName).onLoad(loader.intercept(moduleName, listeningModuleName, callback, errback), errback, Resolver.isBundleRequest(moduleName));
                    });
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {String} interceptedModuleName
                 * @param {String} listeningModuleName
                 * @param {JAR~LoaderManager~Loader~Module~successCallback} callback
                 * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
                 *
                 * @return {JAR~LoaderManager~Loader~Module~successCallback}
                 */
                intercept: function(interceptedModuleName, listeningModuleName, callback, errback) {
                    var loader = this,
                        interceptorType = Resolver.extractInterceptorInfo(interceptedModuleName).type;

                    return interceptorType ? function interceptionListener(moduleName) {
                        interceptors[interceptorType](loader.getModuleRef(moduleName), new Interception(interceptedModuleName, listeningModuleName, callback, errback));
                    } : callback;
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {String} moduleName
                 *
                 * @return {JAR~LoaderManager~Loader~Module}
                 */
                $import: function(moduleName) {
                    return this.getModule(moduleName).request(Resolver.isBundleRequest(moduleName));
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 *
                 * @param {JAR~LoaderManager~Loader~Module} module
                 * @param {Boolean} [addBundle]
                 */
                addToUrlList: function(module, addBundle) {
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
                    var loader = this;

                    modules && arrayEach(modules, function addToUrlList(moduleName) {
                        loader.addToUrlList(loader.getModule(moduleName), Resolver.isBundleRequest(moduleName));
                    });
                },
                /**
                 * @access public
                 *
                 * @memberof JAR~LoaderManager~Loader#
                 */
                resetModulesUrlList: function() {
                    var loader = this;

                    loader.list = [];
                    loader.sorted = {};

                    objectEach(loaderCoreModules, function markModuleSorted(coreModule, moduleName) {
                        loader.sorted[moduleName] = true;
                    });
                }
            };

            return Loader;
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
            /**
             * @access public
             *
             * @memberof JAR~LoaderManager
             *
             * @param {String} loaderContext
             *
             * @return {String}
             */
            setLoaderContext: function(loaderContext) {
                var createLoaderContext = !hasOwnProp(loaders, loaderContext);

                LoaderManager.loader = loaders[loaderContext] = createLoaderContext ? new Loader(loaderContext) : loaders[loaderContext];
                createLoaderContext && loaders[loaderContext].init();

                return loaderContext;
            },
            /**
             * @access public
             *
             * @memberof JAR~LoaderManager
             *
             * @param {(Object|Array)} newConfig
             *
             * @return {Object}
             */
            setModuleConfig: function(newConfig) {
                var System = LoaderManager.getSystem();

                if (System.isArray(newConfig)) {
                    arrayEach(newConfig, function setModuleConfig(config) {
                        LoaderManager.setModuleConfig(config);
                    });
                }
                else if (System.isObject(newConfig)) {
                    (loaders[newConfig.loaderContext] || LoaderManager.loader).setModuleConfig(newConfig);
                }

                return LoaderManager.loader.rootConfig;
            },
            /**
             * @access public
             *
             * @memberof JAR~LoaderManager
             *
             * @param {String} loaderContext
             *
             * @return {Boolean}
             */
            flush: function(loaderContext) {
                var loader = loaderContext ? loaders[loaderContext] : LoaderManager.loader;

                if (loader) {
                    loader.eachModules(function(module) {
                        module.abort(true);
                    });

                    loader.init();
                    loader.getLogger().info('Successfully flushed Loader with context "${0}"', [loader.context]);
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
             * @param {JAR~LoaderManager~Loader~Module~factoryCallback} factory
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
             * @return {Object}
             */
            getCurrentModuleData: function() {
                return LoaderManager.loader.getCurrentModuleData();
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
            getDependencyUrlList: function(loadedCallback, forceRecompute) {
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
                        --modulesLoading || LoaderManager.getDependencyUrlList(loadedCallback, forceRecompute);
                    });
                }
                else {
                    if (forceRecompute || !loader.list.length) {
                        loader.resetModulesUrlList();

                        loader.eachModules(function addModuleToUrlList(module) {
                            loader.addToUrlList(module);
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
            getLogger: function() {
                return LoaderManager.loader.getLogger();
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
             * @param {JAR~LoaderManager~Loader~Module~failCallback} errback
             * @param {Function(string)} progressback
             */
            $importLazy: function(moduleNames, callback, errback, progressback) {
                var loader = LoaderManager.loader,
                    moduleName = loader.currentModuleName,
                    System = loader.getSystem(),
                    refs = [],
                    refsIndexLookUp = {},
                    ref, counter, moduleCount;

                moduleNames = Resolver.resolve(moduleNames, moduleName);
                counter = moduleCount = moduleNames.length;

                arrayEach(moduleNames, function addToLookUp(moduleName, moduleIndex) {
                    refsIndexLookUp[moduleName] = moduleIndex;
                });

                System.isFunction(progressback) || (progressback = undef);

                loader.listenFor(moduleName, moduleNames, function publishLazy(publishingModuleName, data) {
                    ref = !System.isNil(data) ? data : loader.getModuleRef(publishingModuleName);
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
             * @param {String} moduleName
             * @param {Array} bundle
             */
            registerModule: function(moduleName, bundle) {
                var currentLoader = LoaderManager.loader,
                    currentLoaderContext = currentLoader.context,
                    module;

                if (moduleName) {
                    if (!SourceManager.findSource(currentLoaderContext + ':' + moduleName)) {
                        objectEach(loaders, function findLoader(loader, loaderContext) {
                            if (SourceManager.findSource(loaderContext + ':' + moduleName)) {
                                LoaderManager.setLoaderContext(loaderContext);

                                return true;
                            }
                        });
                    }

                    currentLoader = LoaderManager.loader;

                    module = currentLoader.registerModule(moduleName, bundle);

                    if (currentLoader !== loaders[currentLoaderContext]) {
                        LoaderManager.setLoaderContext(currentLoaderContext);
                    }
                }
                else {
                    currentLoader.getLogger().error('No modulename provided');
                }

                return module;
            }
        };

        LoaderManager.addInterceptor('!', function pluginInterceptor(moduleRef, options) {
            if (LoaderManager.getSystem().isFunction(moduleRef.$plugIn)) {
                moduleRef.$plugIn(options);
            }
            else {
                options.fail('Could not call method "$plugIn" on this module');
            }
        });

        LoaderManager.addInterceptor('::', function partialModuleInterceptor(moduleRef, options) {
            var property = options.data;

            if (moduleRef && hasOwnProp(moduleRef, property)) {
                options.success(moduleRef[property]);
            }
            else {
                options.fail('The module has no property "' + property + '"');
            }
        });

        LoaderManager.addCoreModule('System', {}, function systemSetup() {
            var types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
                RE_TEMPLATE_KEY = /\$\{(.*?)\}/g,
                UNKNOWN_KEY = 'UNKNOWN KEY',
                NOTHING = null,
                typeLookup = {},
                toString = ({}).toString,
                isArgs, System;

            /**
             * @exports System
             *
             * @access public
             *
             * @namespace System
             */
            System = {
                env: {
                    global: global
                },
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

                    if (!System.isNil(value)) {
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
                isNil: function(value) {
                    return value == NOTHING;
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
                    var isInstanceOf = false;

                    if (System.isArray(Class)) {
                        arrayEach(Class, function isA(OneClass) {
                            isInstanceOf = System.isA(instance, OneClass);

                            return isInstanceOf;
                        });
                    }
                    else {
                        isInstanceOf = instance instanceof Class;
                    }

                    return isInstanceOf;
                },
                /**
                 * @access public
                 *
                 * @memberof System
                 *
                 * @param {String} message
                 * @param {(Object|Array)} data
                 *
                 * @return {String}
                 */
                format: function(message, data) {
                    formatReplace.data = data;

                    message = message.replace(RE_TEMPLATE_KEY, formatReplace);

                    formatReplace.data = null;

                    return message;
                },
                /**
                 * @access public
                 *
                 * @memberof System
                 *
                 * @param {JAR~LoaderManager~Loader~Interception} pluginRequest
                 */
                $plugIn: function(pluginRequest) {
                    var module = LoaderManager.loader.getModule(pluginRequest.listener);

                    pluginRequest.success(module.getConfig('config'));
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

            arrayEach(types, function createTypeValidator(type) {
                System['is' + type] = typeValidatorSetup(type);
            });

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

            /**
             * @access private
             *
             * @memberof System
             * @inner
             *
             * @param {Array} match
             * @param {String} key
             *
             * @return {String}
             */
            function formatReplace(match, key) {
                var data = formatReplace.data;

                return hasOwnProp(data, key) ? data[key] : UNKNOWN_KEY;
            }
            return System;
        });

        LoaderManager.addCoreModule('System.Logger', {
            deps: ['.!', '.::isArray', '.::isFunction', '.::isNumber', '.::isObject', '.::isString', '.::format']
        }, function systemLoggerSetup(config, isArray, isFunction, isNumber, isObject, isString, format) {
            var debuggers = {},
                loggerCache = {},
                stdLevels = 'log debug info warn error'.split(' '),
                ROOT_LOGCONTEXT = 'JAR';

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

                if (isString(levelOrPriority) && hasOwnProp(logLevels, (levelOrPriority = levelOrPriority.toUpperCase()))) {
                    priority = logLevels[levelOrPriority];
                }
                else if (isNumber(levelOrPriority)) {
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
                return getPriority(level) >= getPriority(config.level);
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
                var debugContext = config.context,
                    includeContext, excludeContext;

                if (isObject(debugContext)) {
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
             * @param {String} context
             * @param {(Array|String)} contextList
             *
             * @return {Boolean}
             */
            function inContextList(context, contextList) {
                var contextDelimiter = ',';

                if (isArray(contextList)) {
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
                    currentDebugger = getActiveDebugger(options.mode || config.mode),
                    debuggerMethod = currentDebugger[level] ? level : 'log';

                if (isDebuggingEnabled(options.debug || config.debug, level, context) && isFunction(currentDebugger[debuggerMethod])) {
                    message = options.tpl[message] || message;

                    if (isString(message) && (isObject(values) || isArray(values))) {
                        message = format(message, values);
                    }

                    currentDebugger[debuggerMethod](context, {
                        timestamp: new Date().toUTCString(),

                        message: message,

                        meta: values
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
                    Logger.logLevels[levelConst] = isNumber(priority) ? priority : Logger.logLevels.ALL;

                    Logger.prototype[level] = function loggerFn(data, values) {
                        this._out(level, data, values);
                    };

                    Logger[level] = function staticLoggerFn(data, values) {
                        Logger[level + 'WithContext'](ROOT_LOGCONTEXT, data, values);
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
                var logContext = LoaderManager.getCurrentModuleData().moduleName;

                Resolver.isRootName(logContext) && (logContext = ROOT_LOGCONTEXT);

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
                }, function(abortedModuleName) {
                    pluginRequest.fail(abortedModuleName);
                });
            };

            /**
             * @access public
             *
             * @memberof System.Logger
             *
             * @param {String} mode
             * @param {Function()} debuggerSetup
             */
            Logger.addDebugger = function(mode, debuggerSetup) {
                var modeConfig = mode + 'Config';

                if (!hasOwnProp(debuggers, mode) && isFunction(debuggerSetup)) {
                    debuggers[mode] = debuggerSetup(function debuggerConfigGetter(option) {
                        return (config[modeConfig] || {})[option];
                    });
                }
            };

            arrayEach(stdLevels, function addLogLevel(stdLevel, levelIndex) {
                Logger.addLogLevel(stdLevel, (levelIndex + 1) * 10);
            });

            Logger.addDebugger('console', function consoleDebuggerSetup(config) {
                var console = global.console,
                    canUseGroups = console && console.group && console.groupEnd,
                    pseudoConsole = {},
                    method, lastLogContext;

                arrayEach(stdLevels, function createConsoleForward(stdLevel) {
                    method = stdLevel;
                    pseudoConsole[method] = console ? forwardConsole(console[method] ? method : stdLevels[0]) : noop;
                });

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

                        global.console[method](metainfo.join(' '), data.message, config('meta') ? data.meta : '');
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
             * @borrows LoaderManager.getCurrentModuleData as getCurrentModuleData
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
                    var refs = [];

                    moduleNames = Resolver.resolve(moduleNames);

                    arrayEach(moduleNames, function use(moduleName) {
                        refs.push(jar.use(moduleName));
                    });

                    return refs;
                },

                use: LoaderManager.getModuleRef,

                $importLazy: LoaderManager.$importLazy,

                getCurrentModuleData: LoaderManager.getCurrentModuleData
            };

            return jar;
        });

        return LoaderManager;
    })();

    LoaderManager.setLoaderContext('default');

    global.JAR = (function jarSetup() {
        var previousJAR = global.JAR,
            moduleNamesQueue = [],
            configurators = {},
            configs = {
                environment: undef,

                environments: {},

                globalAccess: false,

                supressErrors: false
            },
            defaultModuleConfig = {
                cache: true,

                minified: false,

                timeout: 5
            },
            JAR;

        /**
         * @namespace JAR
         *
         * @borrows LoaderManager.registerModule as module
         * @borrows LoaderManager.getDependencyUrlList as getDependencyUrlList
         */
        JAR = {
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {Function()} main
             * @param {JAR~LoaderManager~Loader~Module~failCallback} onAbort
             */
            main: function(main, onAbort) {
                var System = LoaderManager.getSystem(),
                    Logger = LoaderManager.getLogger(),
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

                moduleNamesQueue = [];

                function onImport() {
                    if (configs.supressErrors) {
                        try {
                            Logger.log('Start executing main...');
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

                return this;
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {(String|Object|Array)} moduleData
             */
            $import: function(moduleData) {
                moduleNamesQueue = moduleNamesQueue.concat(moduleData);

                return this;
            },

            module: LoaderManager.registerModule,
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {String} moduleName
             * @param {Array} bundle
             */
            moduleAuto: function(moduleName, bundle) {
                JAR.module(moduleName, bundle).$export();
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {(Object|String)} config
             * @param {(Function)} configurator
             */
            addConfigurator: function(config, configurator) {
                var System = LoaderManager.getSystem();

                if (System.isString(config) && !hasOwnProp(configurators, config) && System.isFunction(configurator)) {
                    configurators[config] = configurator;
                }
                else if (System.isObject(config)) {
                    objectEach(config, function addConfigurator(value, option) {
                        JAR.addConfigurator(option, value);
                    });
                }
            },
            /**
             * @access public
             *
             * @memberof JAR
             *
             * @param {(Object|String)} config
             * @param {*} [value]
             */
            configure: function(config, value) {
                var System = LoaderManager.getSystem(),
                    configurator;

                if (System.isString(config)) {
                    configurator = configurators[config];

                    configs[config] = System.isFunction(configurator) ? configurator(value, configs[config], System) : value;
                }
                else if (System.isObject(config)) {
                    objectEach(config, function configure(value, option) {
                        JAR.configure(option, value);
                    });
                }

                return this;
            },

            getDependencyUrlList: LoaderManager.getDependencyUrlList,
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
            LoaderManager.getLogger().error('Import of "' + abortedModuleName + '" failed!');
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
                bootstrapConfig = global.jarconfig || {},
                bootstrapModules = bootstrapConfig.modules,
                main = SourceManager.getMain();

            if (main) {
                baseUrl = main.substring(0, main.lastIndexOf('/')) || baseUrl;

                if (!bootstrapConfig.main) {
                    bootstrapConfig.main = main;
                }

                defaultModuleConfig.baseUrl = baseUrl;
            }

            if (!LoaderManager.getSystem().isArray(bootstrapModules)) {
                bootstrapModules = bootstrapConfig.modules = bootstrapModules ? [bootstrapModules] : [];
            }

            bootstrapModules.unshift(defaultModuleConfig);

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
                return oldMainScript || (mainScript && SourceManager.loadSource('main', mainScript + '.js'));
            },
            /**
             * @param {Object} newEnvironments
             * @param {Object} oldEnvironments
             *
             * @return {Object<string, function>}
             */
            environments: function(newEnvironments, oldEnvironments) {
                return objectMerge(oldEnvironments, newEnvironments);
            },
            /**
             * @param {String} newEnvironment
             * @param {String} oldEnvironment
             * @param {Object} System
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
                return LoaderManager.setModuleConfig(newModuleConfigs);
            },
            /**
             * @param {String} newLoaderContext
             * @param {String} oldLoaderContext
             *
             * @return {Object}
             */
            loaderContext: function(newLoaderContext, oldLoaderContext) {
                if (newLoaderContext !== oldLoaderContext) {
                    newLoaderContext = LoaderManager.setLoaderContext(newLoaderContext);

                    LoaderManager.setModuleConfig(defaultModuleConfig);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newLoaderContext;
            },
            /**
             * @param {Object} newInterceptors
             * @param {Object} oldInterceptors
             * @param {Object} System
             *
             * @return {Object}
             */
            interceptors: function(newInterceptors, oldInterceptors, System) {
                if (System.isObject(newInterceptors)) {
                    objectEach(newInterceptors, function addInterceptor(newInterceptor, interceptorType) {
                        oldInterceptors = LoaderManager.addInterceptor(interceptorType, newInterceptor);
                    });
                }

                return oldInterceptors;
            }
        });

        bootstrapJAR();

        return JAR;
    })();

})(this);
