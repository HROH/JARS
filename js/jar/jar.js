(function globalSetup(global, undef) {
    'use strict';

    var rootModule = '*',
        separator = '", "',
        slash = '/',
        object = {},
        toString = object.toString,
        hasOwn = object.hasOwnProperty,
        configTransforms = {},
        previousJAR = global.JAR,
        System, SourceManager, LoaderManager, configs, lxNormalize, sxIsObject, sxIsFunction, sxIsArray, sxIsString, sxIsSet;

    /**
     * @access private
     * 
     * @inner
     */
    function noop() {}

    /**
     * @access private
     * 
     * @inner
     * 
     * @param {Object} object
     * @param {String} prop
     * 
     * @return {Boolean}
     */
    function hasOwnProp(object, prop) {
        return hasOwn.call(object, prop);
    }

    configs = {
        cache: true,
        debug: false,
        debugMode: undef,
        environment: undef,
        environments: {},
        globalAccess: false,
        modules: {},
        parseOnLoad: false,
        supressErrors: false,
        timeout: 5
    };

    function systemSetup() {
        var Debuggers = {},
            types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
            idx = 0,
            nothing = null,
            typesLen = types.length,
            typeLookup = {},
            rTemplateKey = /\{\{(.*?)\}\}/g,
            isArgs, System;

        /**
         * @access private
         *
         * @namespace System
         * 
         * @memberof JAR
         * @inner
         * 
         * @alias System
         *
         * @borrows System~getType as getType
         * @borrows window.isNaN as isNaN
         * @borrows window.isFinite as isFinite
         * @borrows System~addDebugger as addDebugger
         * @borrows System~isSet as isSet
         */
        System = {
            getType: getType,

            isNaN: isNaN,

            isFinite: isFinite,

            out: out,
            /**
             * @access public
             * 
             * @method
             * 
             * @param {String} logContext
             * @param {Array<string>} templates
             * 
             * @return {function(*, string, Object)}
             */
            getCustomLog: function(logContext, templates) {
                templates = templates || {};

                return function customLog(data, type, values) {
                    data = templates[data] || data;

                    if (System.isObject(values) && System.isString(data)) {
                        replacer.values = values;

                        data = data.replace(rTemplateKey, replacer);

                        replacer.values = nothing;
                    }

                    out(data, type, logContext);
                };
            },

            addDebugger: addDebugger,

            isSet: isSet
        };

        /**
         * @access public
         * 
         * @memberof System
         * @inner
         *
         * @param {*} data
         * @param {String} type
         */
        function out(data, type, logContext) {
            var Debugger = Debuggers[configs.debugMode],
                output = Debugger[type] || Debugger.log;

            if (configs.debug && System.isFunction(output)) {
                output(data, logContext);
            }
        }

        /**
         * @access public
         * 
         * @memberof System
         * @inner
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        function isSet(value) {
            return value != nothing;
        }

        /**
         * @access public
         * 
         * @memberof System
         * @inner
         *
         * @param {*} value
         *
         * @return {String}
         */
        function getType(value) {
            var type;

            if (isSet(value)) {
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
        }
        /**
         * @access private
         * 
         * @memberof System
         * @inner
         *
         * @param {String} typeDef
         *
         * @return {function(*):boolean}
         */
        function typeTestSetup(typeDef) {
            typeLookup['[object ' + typeDef + ']'] = typeDef = typeDef.toLowerCase();

            return function typeTest(value) {
                return getType(value) === typeDef;
            };
        }
        /**
         * @access private
         * 
         * @memberof System
         * @inner
         * 
         * 
         * 
         * 
         */
        function replacer(match, key) {
            return replacer.values[key] || 'UNKNOWN';
        }

        /**
         * @access public
         * 
         * @memberof System
         * @inner
         *
         * @param {String} mode
         * @param {Function} debuggerSetup
         */
        function addDebugger(mode, debuggerSetup) {
            if (!hasOwnProp(Debuggers, mode) && System.isFunction(debuggerSetup)) {
                Debuggers[mode] = debuggerSetup();
            }
        }

        for (; idx < typesLen; idx++) {
            System['is' + types[idx]] = typeTestSetup(types[idx]);
        }

        isArgs = System.isArguments;

        /**
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        System.isArguments = function(value) {
            var isArguments = false,
                length;

            if (value) {
                length = value.length;
                isArguments = isArgs(value) || (System.isNumber(length) && length === 0 || (length > 0 && ((length - 1) in value)));
            }

            return isArguments;
        };
        /**
         * @access public
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        System.isArrayLike = function(value) {
            return System.isArray(value) || System.isArguments(value);
        };
        /**
         * @access public
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        System.isDefined = function(value) {
            return !System.isUndefined(value);
        };
        /**
         * @access public
         *
         * @param {*} Instance
         * @param {*} Class
         *
         * @return {Boolean}
         */
        System.isA = function(Instance, Class) {
            var isA = false,
                idx = 0,
                classLen = Class.length;

            if (System.isArray(Class)) {
                for (; idx < classLen; idx++) {
                    isA = System.isA(Instance, Class[idx]);

                    if (isA) {
                        break;
                    }
                }
            }
            else {
                isA = Instance instanceof Class;
            }

            return isA;
        };

        addDebugger('console', function consoleDebuggerSetup() {
            var console = global.console,
                canUseGroups = console && console.group && console.groupEnd,
                pseudoConsole = {},
                methods = ['log', 'debug', 'warn', 'error'],
                methodsLen = methods.length,
                idx = 0,
                method,
                lastLogContext;

            for (; idx < methodsLen; idx++) {
                method = methods[idx];
                pseudoConsole[method] = console ? forwardConsole(console[method] ? method : methods[0]) : noop;
            }

            function forwardConsole(method) {
                return function log(data, logContext) {
                    if (canUseGroups && configs.debugGroup) {
                        if (lastLogContext !== logContext) {
                            if (lastLogContext) {
                                global.console.groupEnd(lastLogContext);
                            }

                            if (logContext) {
                                global.console.group(logContext);
                            }

                            lastLogContext = logContext;
                        }
                    }
                    else {
                        logContext && (data = logContext + ': ' + data);
                    }

                    if (method === 'error' && configs.throwOnError) {
                        throw new Error(data);
                    }

                    return global.console[method](data);
                };
            }

            return pseudoConsole;
        });

        return System;
    }

    System = systemSetup();

    sxIsObject = System.isObject;
    sxIsFunction = System.isFunction;
    sxIsArray = System.isArray;
    sxIsString = System.isString;
    sxIsSet = System.isSet;

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
         *
         * @return {String}
         */
        function getTimeStamp() {
            return configs.cache ? '' : ('?_=' + new Date().getTime());
        }

        /**
         *
         * @return {HTMLCollection}
         */
        function getScripts() {
            return doc.getElementsByTagName('script');
        }

        /**
         *
         * @param {String} moduleName
         * @param {String} path
         */
        function addScript(moduleName, path) {
            var script = doc.createElement('script');

            head.appendChild(script);

            script.id = 'jar:' + moduleName;
            script.type = 'text/javascript';
            script.src = path + getTimeStamp();
            script.async = true;

            scripts[moduleName] = script;
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {String} path
         */
        function removeScript(moduleName) {
            var script = scripts[moduleName],
                path = script.src;

            head.removeChild(script);

            delete scripts[moduleName];

            return path;
        }

        /**
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

        /**
         *
         * @param {String} moduleName
         * @param {String} path
         */
        function addStyleSheet(moduleName, path) {
            var styleSheet;

            path = path + getTimeStamp();
            styleSheet = createStyleSheet(path);

            head.insertBefore(styleSheet, head.firstChild);

            styleSheet.id = 'css:' + moduleName;
            styleSheet.setAttribute('type', 'text/css');
            styleSheet.setAttribute('rel', 'stylesheet');
            styleSheet.setAttribute('href', path);
            styleSheets[moduleName] = styleSheet;
        }

        /**
         *
         * @param {String} moduleName
         */
        function removeStyleSheet(moduleName) {
            var styleSheet = styleSheets[moduleName],
                path = styleSheet.href;

            head.removeChild(styleSheet);
            delete styleSheets[moduleName];

            return path;
        }

        return {
            getScripts: getScripts,

            addScript: addScript,

            removeScript: removeScript,

            addStyleSheet: addStyleSheet,

            removeStyleSheet: removeStyleSheet
        };
    })();

    /**
     * @access private
     * 
     * @class LoaderManager
     * 
     * @memberof JAR
     * @inner
     */
    LoaderManager = (function loaderSetup() {
        var loaders = {},
            loaderCoreModules = [],
            rBundleRequest = /\.\*$/,
            rPlugin = /!/,
            rLeadingDot = /^\./,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_ALREADY_LOADED = 0,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_ALREADY_LOADING = 1,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_FOUND = 2,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_LOADED = 3,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_LOADING = 4,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_NOT_DEFINED = 5,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_BUNDLE_REQUESTED = 6,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_CIRCULAR_DEPENDENCIES_FOUND = 7,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_DEPENDENCIES_FOUND = 8,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_DEPENDENCY_FOUND = 9,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_LOADED = 10,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_LOADED_MANUAL = 11,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_LOADING = 12,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_REGISTERED = 13,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_LOADED = 14,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_LOADED_MANUAL = 15,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_LOADING = 16,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_NAME_INVALID = 17,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_RECOVERING = 18,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_REGISTERING = 19,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_REQUESTED = 20,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_SUBSCRIBED = 21,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_PUBLISHED = 22,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_TIMEOUT = 23,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_PLUGIN_NOT_FOUND = 24,
            // Module states
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_WAITING = 1,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_LOADING = 2,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_LOADED = 3,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_REGISTERED = 4,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_LOADED_MANUAL = 5,

            // Bundle states
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_BUNDLE_WAITING = 0,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_BUNDLE_LOADING = 1,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MODULE_BUNDLE_LOADED = 2,
            Module, currentModuleName, currentLoader,
            loaderManagerNormalize, loaderManagerLogMessage, loaderManagerSetModuleConfig, loaderManagerImport;

        Module = (function moduleSetup() {
            /**
             * @access private
             *
             * @constructor Module
             * @alias Module
             * 
             * @memberof Loader~
             * 
             * @param {String} moduleName
             */
            function Module(moduleName) {
                var module = this,
                    implizitDependency = loaderManagerExtractModuleName(moduleName),
                    dirParts, fileName, pathParts, firstLetter;

                module.name = moduleName;
                pathParts = moduleName.split('.');
                module.fileName = fileName = pathParts.pop();

                if (implizitDependency) {
                    module.dep = implizitDependency;
                }

                dirParts = pathParts;

                firstLetter = fileName.charAt(0);

                if (firstLetter === firstLetter.toLowerCase()) {
                    dirParts.push(fileName);
                }

                module.dirPath = dirParts.join(slash) + slash;

                module.state = MODULE_WAITING;
                module.bundleState = MODULE_BUNDLE_WAITING;

                module.pluginData = {};
            }

            Module.prototype = {
                /**
                 * @access public
                 *
                 * @alias Module
                 * 
                 * @memberof Module#
                 */
                constructor: Module,
                /**
                 * @access public
                 * 
                 * @type {Number}
                 * 
                 * @memberof Module#
                 */
                depsCounter: 0,
                /**
                 * @access public
                 * 
                 * @type {Number}
                 * 
                 * @memberof Module#
                 */
                bundleCounter: 0,
                /**
                 * @access public
                 * 
                 * @memberof Module#
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
                 * @memberof Module#
                 * 
                 * @param {Number} state
                 */
                setState: function(state) {
                    this.state = state;
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 * 
                 * @return {Boolean}
                 */
                isRegistered: function() {
                    return this.state === MODULE_REGISTERED || this.isState(MODULE_LOADED) || this.isState(MODULE_LOADED_MANUAL);
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
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
                 * @memberof Module#
                 * 
                 * @param {Number} bundleState
                 */
                setBundleState: function(bundleState) {
                    this.bundleState = bundleState;
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                unsetBundleLoading: function() {
                    var module = this;

                    if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                        module.bundleState = MODULE_BUNDLE_WAITING;

                        module.dep && loaderManagerGetModule(module.dep).unsetBundleLoading();
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                setBundleLoaded: function() {
                    var module = this,
                        bundleName = loaderManagerGetBundleName(module.name),
                        messageType = module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED;

                    module.bundleState = MODULE_BUNDLE_LOADED;

                    loaderManagerLogMessage(messageType, bundleName);

                    currentLoader.notify(bundleName);
                },

                getAllDependencies: function() {
                    var module = this,
                        implizitDependency = module.dep,
                        dependencies = module.deps ? module.deps.slice() : [];

                    implizitDependency && dependencies.unshift(implizitDependency);

                    return dependencies;
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 * 
                 * @param {String} fileType
                 * 
                 * @return {String}
                 */
                getFullPath: function(fileType) {
                    var module = this,
                        keyDirPath = 'dirPath',
                        keyFileName = 'fileName',
                        dirPath = module.getConfig(keyDirPath) || module[keyDirPath],
                        fileName = module.getConfig(keyFileName) || module[keyFileName],
                        fullPath = module.getConfig('baseUrl') + dirPath + fileName;

                    if (fileType == 'js') {
                        fullPath += module.getConfig('versionSuffix') + module.getConfig('minified');
                    }

                    fullPath += '.' + fileType;

                    return fullPath;
                },

                getConfig: function(option, skipUntil) {
                    return loaderManagerGetModuleConfig(this.name, option, skipUntil);
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                depsReady: function() {
                    var module = this,
                        moduleName = module.name;

                    if (module.isRegistered() && !module.isState(MODULE_LOADED)) {
                        module.hookUp();

                        module.setState(MODULE_LOADED);
                        loaderManagerLogMessage(MSG_MODULE_LOADED, moduleName);
                        currentLoader.notify(moduleName);
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                bundleReady: function() {
                    var module = this,
                        bundleName = loaderManagerGetBundleName(module.name),
                        messageType = module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED;

                    if (!module.isBundleState(MODULE_BUNDLE_LOADED)) {
                        module.setBundleState(MODULE_BUNDLE_LOADED);

                        module.bundleState = MODULE_BUNDLE_LOADED;

                        loaderManagerLogMessage(messageType, bundleName);

                        currentLoader.notify(bundleName);
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 * 
                 * @param {Array<string>} moduleNames
                 * @param {Boolean} asBundle
                 */
                listenFor: function(moduleNames, asBundle) {
                    var module = this,
                        moduleName = module.name,
                        moduleCount = moduleNames.length,
                        moduleDepsBundlePrefix = asBundle ? 'bundle' : 'deps',
                        moduleCounter = moduleDepsBundlePrefix + 'Counter',
                        moduleReady = moduleDepsBundlePrefix + 'Ready';

                    module[moduleCounter] += moduleCount;

                    if (!module[moduleCounter]) {
                        module[moduleReady]();
                    }
                    else if (moduleCount) {
                        loaderManagerLogMessage(MSG_MODULE_SUBSCRIBED, moduleName, {
                            subs: moduleNames.join(separator)
                        });

                        loaderManagerListenFor(moduleNames, function onModuleLoaded(publishingModuleName, pluginData) {
                            loaderManagerLogMessage(MSG_MODULE_PUBLISHED, moduleName, {
                                pub: publishingModuleName
                            });

                            if (sxIsSet(pluginData)) {
                                module.pluginData[publishingModuleName] = pluginData;
                            }

                            --module[moduleCounter] || module[moduleReady]();
                        }, function onModuleAborted() {
                            asBundle ? module.unsetBundleLoading() : loaderManagerAbort(moduleName);
                        });
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                hookUp: function() {
                    var module = this,
                        moduleName = module.name,
                        factory = module.factory,
                        depHooks = [],
                        idx = 0,
                        implizitDependency = module.dep,
                        dependencies = module.deps,
                        depLen = dependencies ? dependencies.length : 0,
                        hook = moduleName === rootModule ? currentLoader : loaderManagerGetModuleHook(implizitDependency || rootModule),
                        dependencyName, pluginData;

                    for (; idx < depLen; idx++) {
                        dependencyName = dependencies[idx];
                        pluginData = module.pluginData[dependencyName];
                        depHooks.push(pluginData ? pluginData : loaderManagerGetModuleHook(dependencyName));
                    }

                    loaderManagerSetCurrentModuleName(module.name);

                    module.hook = hook[module.fileName] = sxIsFunction(factory) ? factory.apply(hook, depHooks) : factory || {};

                    loaderManagerSetCurrentModuleName(rootModule);
                }
            };

            return Module;
        })();

        /**
         * @access private
         * 
         * @function
         * 
         * @memberof Loader~
         * 
         * @param {String} messageType
         * @param {String} moduleName
         * @param {Object} values
         */
        loaderManagerLogMessage = (function loaderManagerLogMessageSetup() {
            var messageTemplates = [],
                messageTypes = {},
                module = 'module',
                bundle = 'bundle',
                requested = '{{what}} requested',
                startLoad = 'started loading {{what}}',
                endLoad = 'finished loading {{what}}',
                attemptedTo = 'attempted to ',
                attemptLoad = attemptedTo + 'load {{what}} but {{why}}',
                already = 'is already ',
                alreadyLoading = already + 'loading',
                alreadyLoaded = already + 'loaded',
                attemptLoadModule = replaceModule(attemptLoad),
                attemptLoadBundle = replaceBundle(attemptLoad),
                loaderManagerLog;

            /**
             * 
             * @param {String} message
             * @param {String} what
             * 
             * @return {String}
             */
            function replaceWhat(message, what) {
                return message.replace('{{what}}', what + ' "{{mod}}"');
            }

            /**
             * 
             * @param {String} message
             * 
             * @return {String}
             */
            function replaceModule(message) {
                return replaceWhat(message, module);
            }

            /**
             * 
             * @param {String} message
             * 
             * @return {String}
             */
            function replaceBundle(message) {
                return replaceWhat(message, bundle);
            }

            /**
             * 
             * @param {String} message
             * @param {String} why
             * 
             * @return {String}
             */
            function replaceWhy(message, why) {
                return message.replace('{{why}}', why);
            }

            /**
             * 
             * @param {String} message
             * 
             * @return {String}
             */
            function replaceAlreadyLoaded(message) {
                return replaceWhy(message, alreadyLoaded);
            }

            /**
             * 
             * @param {String} message
             * 
             * @return {String}
             */
            function replaceAlreadyLoading(message) {
                return replaceWhy(message, alreadyLoading);
            }

            /**
             * 
             * @param {Array.<number>} messages
             * @param {String} messageType
             */
            function setTypeForMessages(messages, messageType) {
                var idx = 0,
                    messagesLen = messages.length;

                for (; idx < messagesLen; idx++) {
                    messageTypes[messages[idx]] = messageType;
                }
            }

            setTypeForMessages([
            MSG_CIRCULAR_DEPENDENCIES_FOUND,
            MSG_MODULE_NAME_INVALID,
            MSG_PLUGIN_NOT_FOUND,
            MSG_TIMEOUT], 'error');

            setTypeForMessages([
            MSG_BUNDLE_ALREADY_LOADED,
            MSG_BUNDLE_ALREADY_LOADING,
            MSG_BUNDLE_NOT_DEFINED,
            MSG_MODULE_ALREADY_LOADED,
            MSG_MODULE_ALREADY_LOADING,
            MSG_MODULE_ALREADY_LOADED_MANUAL,
            MSG_MODULE_ALREADY_REGISTERED], 'warn');

            messageTemplates[MSG_BUNDLE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadBundle);
            messageTemplates[MSG_BUNDLE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadBundle);
            messageTemplates[MSG_BUNDLE_FOUND] = replaceBundle('found bundlemodules "{{bundle}}" for {{what}}');
            messageTemplates[MSG_BUNDLE_LOADED] = replaceBundle(endLoad);
            messageTemplates[MSG_BUNDLE_LOADING] = replaceBundle(startLoad);
            messageTemplates[MSG_BUNDLE_NOT_DEFINED] = replaceWhy(attemptLoadBundle, 'bundle is not defined');
            messageTemplates[MSG_BUNDLE_REQUESTED] = replaceBundle(requested);

            messageTemplates[MSG_CIRCULAR_DEPENDENCIES_FOUND] = replaceModule('found circular dependencies "{{deps}}" for {{what}}');

            messageTemplates[MSG_DEPENDENCIES_FOUND] = replaceModule('found explizit dependencies "{{deps}}" for {{what}}');
            messageTemplates[MSG_DEPENDENCY_FOUND] = replaceModule('found implizit dependency "{{dep}}" for {{what}}');

            messageTemplates[MSG_MODULE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadModule);
            messageTemplates[MSG_MODULE_ALREADY_LOADED_MANUAL] = replaceAlreadyLoaded(attemptLoadModule) + ' manual';
            messageTemplates[MSG_MODULE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadModule);

            messageTemplates[MSG_MODULE_ALREADY_REGISTERED] = replaceWhy(replaceModule(attemptedTo + 'register {{what}} but {{why}}'), already + 'registered');

            messageTemplates[MSG_MODULE_LOADED] = replaceModule(endLoad);
            messageTemplates[MSG_MODULE_LOADED_MANUAL] = replaceModule('{{what}} was loaded manual');
            messageTemplates[MSG_MODULE_LOADING] = replaceModule(startLoad);

            messageTemplates[MSG_MODULE_NAME_INVALID] = '"{{mod}}" is no valid modulename';
            messageTemplates[MSG_MODULE_PUBLISHED] = '"{{pub}}" published to "{{mod}}"';
            messageTemplates[MSG_MODULE_RECOVERING] = replaceModule('{{what}} tries to recover...');
            messageTemplates[MSG_MODULE_REGISTERING] = replaceModule('registering {{what}}...');
            messageTemplates[MSG_MODULE_REQUESTED] = replaceModule(requested);
            messageTemplates[MSG_MODULE_SUBSCRIBED] = replaceModule('{{what}} subscribed to "{{subs}}"');

            messageTemplates[MSG_PLUGIN_NOT_FOUND] = replaceModule('could not call method "plugIn" on {{what}} with data "{{data}}"');
            messageTemplates[MSG_TIMEOUT] = replaceModule('aborted loading {{what}} after {{sec}} second(s) - module may not be available on path "{{path}}"');

            loaderManagerLog = System.getCustomLog('Loader', messageTemplates);

            /**
             * @access private
             * 
             * @function
             * 
             * @memberof Loader~
             * 
             * @param {String} messageType
             * @param {String} moduleName
             * @param {Object} values
             */
            function loaderManagerLogMessage(messageType, moduleName, values) {
                var logType = messageTypes[messageType] || 'log';

                values = values || {};
                values.mod = moduleName;

                loaderManagerLog(messageType, logType, values);
            }

            return loaderManagerLogMessage;
        })();

        /**
         *
         * @param {String} moduleName
         * 
         * @return {String}
         */
        function loaderManagerExtractModuleName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf('.'));
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {String}
         */
        function loaderManagerExtractPluginModuleName(moduleName) {
            return moduleName.split('!')[0];
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {String}
         */
        function loaderManagerGetBundleName(moduleName) {
            return moduleName + '.*';
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {Boolean}
         */
        function loaderManagerIsBundleRequest(moduleName) {
            return rBundleRequest.test(moduleName);
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {Boolean}
         */
        function loaderManagerIsPluginRequest(moduleName) {
            return rPlugin.test(moduleName);
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {Object}
         */
        function loaderManagerGetModule(moduleName) {
            return currentLoader.getModule(moduleName);
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {*}
         */
        function loaderManagerGetModuleHook(moduleName) {
            return loaderManagerGetModule(moduleName).hook;
        }

        /**
         *
         * @param {String} moduleName
         */
        loaderManagerImport = (function loaderManagerImportSetup() {
            /**
             *
             * @param {String} moduleName
             */
            function loaderManagerImport(moduleName) {
                (loaderManagerIsBundleRequest(moduleName) ? loaderManagerImportBundle : loaderManagerImportModule)(moduleName);
            }

            /**
             *
             * @param {String} moduleName
             */
            function loaderManagerImportModule(moduleName) {
                var module = loaderManagerGetModule(moduleName),
                    messageType;

                loaderManagerLogMessage(MSG_MODULE_REQUESTED, moduleName);

                if (module.isState(MODULE_WAITING)) {
                    loaderManagerImportImplizitDependency(moduleName);

                    loaderManagerLogMessage(MSG_MODULE_LOADING, moduleName);

                    module.setState(MODULE_LOADING);

                    module.timeoutID = global.setTimeout(function abortModule() {
                        loaderManagerAbort(moduleName);
                    }, (configs.timeout) * 1000);

                    SourceManager.addScript(moduleName, module.getFullPath('js'), module.getConfig('adapter'));
                }
                else {
                    if (module.isState(MODULE_LOADED)) {
                        messageType = MSG_MODULE_ALREADY_LOADED;
                    }
                    else if (module.isState(MODULE_LOADED_MANUAL)) {
                        messageType = MSG_MODULE_ALREADY_LOADED_MANUAL;
                    }
                    else {
                        messageType = MSG_MODULE_ALREADY_LOADING;
                    }

                    loaderManagerLogMessage(messageType, moduleName);
                }
            }

            /**
             *
             * @param {String} bundleName
             */
            function loaderManagerImportBundle(bundleName) {
                var module = loaderManagerGetModule(bundleName),
                    messageType;

                loaderManagerLogMessage(MSG_BUNDLE_REQUESTED, bundleName);

                if (module.isBundleState(MODULE_BUNDLE_LOADED)) {
                    messageType = MSG_BUNDLE_ALREADY_LOADED;
                }
                else if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                    messageType = MSG_BUNDLE_ALREADY_LOADING;
                }
                else {
                    loaderManagerListenFor([module.name], loaderManagerImportBundleForModule);

                    messageType = MSG_BUNDLE_LOADING;
                }

                loaderManagerLogMessage(messageType, bundleName);
            }

            /**
             *
             * @param {String} moduleName
             */
            function loaderManagerImportBundleForModule(moduleName) {
                var module = loaderManagerGetModule(moduleName);

                if (!(module.isBundleState(MODULE_BUNDLE_LOADING) || module.isBundleState(MODULE_BUNDLE_LOADED))) {
                    module.setBundleState(MODULE_BUNDLE_LOADING);

                    module.listenFor(module.bundle, true);
                }
            }

            return loaderManagerImport;
        })();

        /**
         *
         * @param {String} moduleName
         */
        function loaderManagerImportImplizitDependency(moduleName) {
            var module = loaderManagerGetModule(moduleName),
                implizitDependency = module.dep;

            if (implizitDependency) {
                loaderManagerLogMessage(MSG_DEPENDENCY_FOUND, moduleName, {
                    dep: implizitDependency
                });

                module.listenFor([implizitDependency]);
            }
        }

        /**
         * 
         * @param {Array.<string>} moduleNames
         * @param {function(string)} callback
         * @param {function(string)} errback
         */
        function loaderManagerListenFor(moduleNames, callback, errback) {
            var moduleQueues = currentLoader.queues,
                moduleCount = moduleNames.length,
                idx = 0,
                pluginArgs = {},
                pluginParts, moduleName, module, queue, onModuleLoaded;

            function onPluginModuleLoaded(pluginName) {
                var data = pluginArgs[pluginName],
                    pluginModule = loaderManagerGetModuleHook(pluginName);

                delete pluginArgs[pluginName];

                if (sxIsFunction(pluginModule.plugIn)) {
                    pluginModule.plugIn({
                        onSuccess: function(pluginData) {
                            callback(pluginName + '!' + data, pluginData);
                        },

                        onError: errback,

                        data: data
                    });
                }
                else {
                    loaderManagerLogMessage(MSG_PLUGIN_NOT_FOUND, pluginName, {
                        data: data
                    });

                    errback(pluginName);
                }
            }

            for (; idx < moduleCount; idx++) {
                moduleName = moduleNames[idx];

                if (loaderManagerIsPluginRequest(moduleName)) {
                    pluginParts = moduleName.split(rPlugin);
                    moduleName = pluginParts.shift();
                    pluginArgs[moduleName] = pluginParts.join('!');
                    onModuleLoaded = onPluginModuleLoaded;
                }
                else {
                    onModuleLoaded = callback;
                }

                loaderManagerImport(moduleName);

                queue = moduleQueues[moduleName];

                module = loaderManagerGetModule(moduleName);

                if (!module.isState(MODULE_LOADED) || (loaderManagerIsBundleRequest(moduleName) && !module.isBundleState(MODULE_BUNDLE_LOADED))) {
                    queue.push([onModuleLoaded, errback]);
                }
                else {
                    onModuleLoaded(moduleName);
                }
            }
        }

        /**
         *
         * @param {String} moduleName
         * @param {Boolean} silent
         */
        function loaderManagerAbort(moduleName, silent) {
            var moduleQueues = currentLoader.queues,
                module = loaderManagerGetModule(moduleName),
                queue = moduleQueues[moduleName].concat(moduleQueues[loaderManagerGetBundleName(moduleName)]),
                errback, path;

            if (module.isState(MODULE_LOADING)) {
                path = SourceManager.removeScript(moduleName);

                if (!silent) {
                    loaderManagerLogMessage(MSG_TIMEOUT, moduleName, {
                        path: path,
                        sec: configs.timeout
                    });

                    module.setState(MODULE_WAITING);

                    if (!loaderManagerFindRecover(moduleName)) {
                        while (queue.length) {
                            errback = queue.shift()[1];

                            if (sxIsFunction(errback)) {
                                errback(moduleName);
                            }
                        }
                    }
                }
            }
        }

        /**
         *
         * @param {String} moduleName
         * 
         * @return {Boolean}
         */
        function loaderManagerFindRecover(moduleName) {
            var module = loaderManagerGetModule(moduleName),
                foundRecover,
                recoverModuleName,
                recoverModuleDependency;

            foundRecover = module.getConfig('recover', module.nextRecover);

            if (foundRecover) {
                recoverModuleName = foundRecover.restrict;

                // This is a recover on a higher level
                if (recoverModuleName !== moduleName) {
                    // extract the next recovermodule
                    recoverModuleDependency = loaderManagerGetModule(recoverModuleName).dep;
                    module.nextRecover = recoverModuleDependency ? loaderManagerGetBundleName(recoverModuleDependency) : undef;

                    // Only recover this module
                    foundRecover.restrict = moduleName;
                }

                loaderManagerSetModuleConfig(foundRecover);

                // Restore module recover assoziation
                foundRecover.restrict = recoverModuleName;

                loaderManagerLogMessage(MSG_MODULE_RECOVERING, moduleName);

                loaderManagerImport(moduleName);
            }
            else {
                delete module.nextRecover;
            }

            return !!foundRecover;
        }

        /**
         * 
         * @param {(string|Array|Object)} modules
         * @param {String} referenceModule
         * @param {Boolean} isRelative
         * 
         * @return {Array.<string>}
         */
        loaderManagerNormalize = (function loaderManagerNormalizeSetup() {
            /**
             *
             * @param {Array} modules
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             * 
             * @return {Array.<string>}
             */
            function normalizeArray(modules, referenceModule, isRelative) {
                var normalizedModules = [],
                    idx = 0,
                    moduleCount = modules.length;

                for (; idx < moduleCount; idx++) {
                    normalizedModules = normalizedModules.concat(normalize(modules[idx], referenceModule, isRelative));
                }

                return normalizedModules;
            }

            /**
             *
             * @param {Object} modules
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             * 
             * @return {Array}
             */
            function normalizeObject(modules, referenceModule, isRelative) {
                var normalizedModules = [],
                    tmpReferenceModule;

                for (tmpReferenceModule in modules) {
                    if (hasOwnProp(modules, tmpReferenceModule)) {
                        normalizedModules = normalizedModules.concat(normalize(modules[tmpReferenceModule], tmpReferenceModule, true));
                    }
                }

                return normalizeArray(normalizedModules, referenceModule, isRelative);
            }

            /**
             *
             * @param {String} moduleName
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             *
             * @return {Array}
             */
            function normalizeString(moduleName, referenceModule, isRelative) {
                var normalizedModules = [];

                if (!isRelative) {
                    while (referenceModule && rLeadingDot.test(moduleName)) {
                        moduleName = moduleName.replace(rLeadingDot, '');
                        referenceModule = loaderManagerExtractModuleName(referenceModule) || undef;
                        isRelative = !! referenceModule;
                    }
                }

                if (isRelative) {
                    moduleName = buildAbsoluteModuleName(moduleName, referenceModule);
                }

                if (!moduleName || (!isRelative && rLeadingDot.test(moduleName))) {
                    loaderManagerLogMessage(MSG_MODULE_NAME_INVALID, moduleName);
                }
                else {
                    normalizedModules = [moduleName];
                }

                return normalizedModules;
            }

            function buildAbsoluteModuleName(moduleName, referenceModule) {
                var dot = '.';

                if (!moduleName || moduleName === dot) {
                    moduleName = dot = '';
                }
                else if (!referenceModule.replace(/\./g, '') || (loaderManagerIsPluginRequest(moduleName) && !loaderManagerExtractPluginModuleName(moduleName))) {
                    dot = '';
                }

                return referenceModule + dot + moduleName;
            }

            /**
             *
             * @param {(string|Object|Array)} modules
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             *
             * @return {Array.<string>}
             */
            function normalize(modules, referenceModule, isRelative) {
                var normalizer;

                if (sxIsObject(modules)) {
                    normalizer = normalizeObject;
                }
                else if (sxIsArray(modules)) {
                    normalizer = normalizeArray;
                }
                else if (sxIsString(modules)) {
                    normalizer = normalizeString;
                }

                return normalizer ? normalizer(modules, referenceModule, isRelative) : [];
            }

            return normalize;
        })();

        function loaderManagerHasCircularDependencies(moduleName) {
            var circularDependencies = loaderManagerFindCircularDependencies(moduleName),
                hasCircularDependency = !!circularDependencies.length;

            if (hasCircularDependency) {
                loaderManagerLogMessage(MSG_CIRCULAR_DEPENDENCIES_FOUND, moduleName, {
                    deps: circularDependencies.join(separator)
                });
            }

            return hasCircularDependency;
        }

        // TODO is there a more performant way to check for circular dependencies?
        function loaderManagerFindCircularDependencies(moduleName, traversedModules) {
            var module = loaderManagerGetModule(moduleName),
                dependencies = module.getAllDependencies(),
                depLen = dependencies.length,
                idx = 0,
                circularDependencies = [];

            moduleName = module.name;
            traversedModules = traversedModules || {};

            if (moduleName in traversedModules) {
                circularDependencies = [moduleName];
            }
            else {
                traversedModules[moduleName] = true;

                for (; idx < depLen; idx++) {
                    circularDependencies = loaderManagerFindCircularDependencies(dependencies[idx], traversedModules);

                    if (circularDependencies.length) {
                        circularDependencies.unshift(moduleName);
                        break;
                    }
                }

                delete traversedModules[moduleName];
            }

            return circularDependencies;
        }

        /**
         *
         * @param {String} moduleName
         * @param {String} option
         * @param {String} skipUntil
         * 
         * @return {String}
         */
        function loaderManagerGetModuleConfig(moduleName, option, skipUntil) {
            var moduleConfigs = configs.modules,
                nextLevel = moduleName,
                skip = false,
                result;

            do {
                if (!skip && moduleConfigs[moduleName]) {
                    result = moduleConfigs[moduleName][option];
                }

                if (nextLevel) {
                    moduleName = loaderManagerGetBundleName(nextLevel);
                    nextLevel = loaderManagerExtractModuleName(nextLevel);
                }
                else {
                    moduleName = moduleName !== rootModule ? rootModule : undef;
                }

                if (skipUntil) {
                    skip = skipUntil !== moduleName;
                    skip || (skipUntil = undef);
                }

            } while (!sxIsSet(result) && moduleName);

            return result || '';
        }

        loaderManagerSetModuleConfig = (function moduleConfigSetterSetup() {
            var stringCheck = 'String',
                objectCheck = 'Object',
                rEndSlash = /\/$/,
                propertyDefinitions = {
                    baseUrl: {
                        check: stringCheck,

                        transform: addEndSlashTransForm
                    },

                    bundle: {
                        check: 'Set',

                        transform: function bundleTransform(bundleModules, moduleName) {
                            var isRootModule = moduleName === rootModule,
                                bundle;

                            if (isRootModule) {
                                loaderManagerIsBundleRequest(moduleName) && (moduleName = loaderManagerExtractModuleName(moduleName));

                                bundle = loaderManagerNormalize(bundleModules, moduleName, !isRootModule);
                            }

                            return bundle;
                        }
                    },

                    config: {
                        check: objectCheck
                    },

                    dirPath: {
                        check: stringCheck,

                        transform: addEndSlashTransForm
                    },

                    fileName: {
                        check: stringCheck
                    },

                    minified: {
                        check: 'Boolean',

                        transform: function minTransform(loadMin) {
                            return loadMin ? '.min' : '';
                        }
                    },

                    recover: {
                        check: objectCheck,

                        transform: function recoverTransform(recoverData, moduleName) {
                            var recover = {},
                                prop;

                            for (prop in recoverData) {
                                hasOwnProp(recoverData, prop) && (recover[prop] = recoverData[prop]);
                            }

                            recover.restrict = moduleName;

                            return recover;
                        }
                    },

                    versionSuffix: {
                        check: stringCheck
                    }
                };

            function addEndSlashTransForm(prop) {
                return (!prop || rEndSlash.test(prop)) ? prop : prop + slash;
            }

            function setProperty(moduleConfig, moduleName, property, propertyValue) {
                var propertyDefinition = propertyDefinitions[property],
                    propertyTransform = propertyDefinition.transform,
                    propertyCheck = 'is' + propertyDefinition.check;

                if (System[propertyCheck](propertyValue)) {
                    moduleConfig[property] = propertyTransform ? propertyTransform(propertyValue, moduleName) : propertyValue;
                }
                else if (System.isNull(propertyValue)) {
                    delete moduleConfig[property];
                }
            }

            /**
             *
             * @param {(Object|Array)} moduleConfigs
             * @param {Object<string, object>} oldModuleConfigs
             *
             * @return {Object<string, object>}
             */
            function loaderManagerSetModuleConfig(moduleConfigs, oldModuleConfigs) {
                var idx = 0,
                    property, moduleConfigsLen, oldModuleConfig, modules, moduleName, mi, moduleCount;

                oldModuleConfigs = oldModuleConfigs || configs.modules;

                if (sxIsArray(moduleConfigs)) {
                    moduleConfigsLen = moduleConfigs.length;

                    for (; idx < moduleConfigsLen; idx++) {
                        loaderManagerSetModuleConfig(moduleConfigs[idx], oldModuleConfigs);
                    }
                }
                else if (sxIsObject(moduleConfigs)) {
                    modules = loaderManagerNormalize(moduleConfigs.restrict || rootModule);
                    moduleCount = modules.length;

                    for (mi = 0; mi < moduleCount; mi++) {
                        moduleName = modules[mi];
                        oldModuleConfig = oldModuleConfigs[moduleName] = oldModuleConfigs[moduleName] || {};

                        for (property in propertyDefinitions) {
                            hasOwnProp(propertyDefinitions, property) && setProperty(oldModuleConfig, moduleName, property, moduleConfigs[property]);
                        }
                    }
                }

                return oldModuleConfigs;
            }

            return loaderManagerSetModuleConfig;
        })();

        /**
         *
         * @param {String} moduleName
         */
        function loaderManagerSetCurrentModuleName(moduleName) {
            currentModuleName = moduleName;
        }

        /**
         * @class
         * @lends JAR~Loader
         * @alias Loader
         */
        function Loader() {
            var loader = this;

            loader.modules = {};
            loader.queues = {};

            loader.resetModulesList();

            loader.setCurrent();

            loader.registerCore();
        }

        Loader.prototype = {
            constructor: Loader,

            setCurrent: function() {
                currentLoader = this;
            },
            /**
             *
             * @param {String} moduleName
             *
             * @return {Module}
             */
            getModule: function(moduleName) {
                var loader = this;

                if (loaderManagerIsBundleRequest(moduleName)) {
                    moduleName = loaderManagerExtractModuleName(moduleName);
                }
                else if (loaderManagerIsPluginRequest(moduleName)) {
                    moduleName = loaderManagerExtractPluginModuleName(moduleName);
                }

                return loader.modules[moduleName] || loader.createModule(moduleName);
            },

            createModule: function(moduleName) {
                var loader = this,
                    module = loader.modules[moduleName] = new Module(moduleName),
                    moduleQueues = loader.queues;

                moduleQueues[moduleName] = [];
                moduleQueues[loaderManagerGetBundleName(moduleName)] = [];

                return module;
            },

            registerCore: function() {
                var loader = this,
                    idx = 0,
                    coreModLen = loaderCoreModules.length,
                    coreModule;

                for (; idx < coreModLen; idx++) {
                    coreModule = loaderCoreModules[idx];
                    loader.register(coreModule[0], coreModule[1]);
                }
            },
            /**
             * 
             * @param {Object<string, *>} properties
             * @param {function()} factory
             */
            register: function(properties, factory) {
                var loader = this,
                    moduleName = properties.MID,
                    autoRegisterLevel = properties.autoRegLvl,
                    module = loader.getModule(moduleName),
                    implizitDependency = module.dep,
                    bundle, dependencies;

                if (!module.isRegistered()) {
                    loaderManagerLogMessage(MSG_MODULE_REGISTERING, moduleName);

                    module.factory = factory;

                    if (autoRegisterLevel > 0 && implizitDependency) {
                        loaderManagerAbort(implizitDependency, true);

                        loader.register({
                            MID: implizitDependency,
                            autoRegLvl: --autoRegisterLevel
                        });
                    }

                    if (module.isState(MODULE_LOADING)) {
                        global.clearTimeout(module.timeoutID);
                        module.setState(MODULE_REGISTERED);
                    }
                    else {
                        loaderManagerLogMessage(MSG_MODULE_LOADED_MANUAL, moduleName);

                        module.setState(MODULE_LOADED_MANUAL);

                        implizitDependency && loaderManagerImportImplizitDependency(moduleName);
                    }

                    if (properties.styles) {
                        SourceManager.addStyleSheet(moduleName, module.getFullPath('css'));
                    }

                    bundle = loaderManagerNormalize(properties.bundle, moduleName, true);

                    dependencies = loaderManagerNormalize(properties.deps, moduleName);

                    module.deps = dependencies;
                    module.bundle = bundle;

                    if (dependencies.length) {
                        loaderManagerLogMessage(MSG_DEPENDENCIES_FOUND, moduleName, {
                            deps: dependencies.join(separator)
                        });
                    }

                    module.listenFor(dependencies);

                    if (bundle.length) {
                        loaderManagerLogMessage(MSG_BUNDLE_FOUND, loaderManagerGetBundleName(moduleName), {
                            bundle: bundle.join(separator)
                        });
                    }

                    if (loaderManagerHasCircularDependencies(moduleName)) {
                        loaderManagerAbort(moduleName);
                    }
                }
                else {
                    loaderManagerLogMessage(MSG_MODULE_ALREADY_REGISTERED, moduleName);
                }
            },
            /**
             * 
             * @param {String} moduleName
             */
            notify: function(moduleName) {
                var loader = this,
                    queue = loader.queues[moduleName];

                loader.pushModule(moduleName);

                if (queue) {
                    while (queue.length) {
                        queue.shift()[0](moduleName);
                    }
                }
            },
            /**
             *
             * @param {Array} modules
             */
            pushModules: function(modules) {
                var idx = 0,
                    moduleCount;

                moduleCount = modules ? modules.length : 0;

                for (; idx < moduleCount; idx++) {
                    this.pushModule(modules[idx]);
                }
            },
            /**
             *
             * @param {String} moduleName
             */
            pushModule: function(moduleName) {
                var loader = this,
                    sortedModules = loader.sorted,
                    isBundleRequested = loaderManagerIsBundleRequest(moduleName),
                    module = loader.getModule(moduleName),
                    dependencies = module.getAllDependencies();

                moduleName = module.name;

                if (module.isState(MODULE_LOADED)) {
                    if (!hasOwnProp(sortedModules, moduleName)) {
                        loader.pushModules(dependencies);

                        loader.list.push(module.getFullPath('js'));
                        sortedModules[moduleName] = true;
                    }

                    if (isBundleRequested) {
                        loader.pushModules(module.bundle);
                    }
                }
            },

            resetModulesList: function() {
                var loader = this,
                    idx = 0,
                    coreModLen = loaderCoreModules.length;

                loader.list = [];
                loader.sorted = {};

                for (; idx < coreModLen; idx++) {
                    loader.sorted[loaderCoreModules[idx][0].MID] = true;
                }
            }
        };

        return {
            normalize: lxNormalize = loaderManagerNormalize,

            setModuleConfig: loaderManagerSetModuleConfig,

            setContext: function(context) {
                context = context || rootModule;

                if (loaders[context]) {
                    loaders[context].setCurrent();
                }
                else {
                    loaders[context] = new Loader();
                }

                return context;
            },

            addCoreModule: function(moduleName, properties, module) {
                properties = properties || {};
                properties.MID = moduleName;
                loaderCoreModules.push([properties, module]);
            },
            /**
             *
             * @return {String}
             */
            getCurrentModuleName: function() {
                return currentModuleName;
            },
            /**
             * Computes an array of all the loaded modules
             * in the order they are dependending on each other
             * This method can be used to create a custom build
             * preferable with grunt and phantomjs
             *
             * it is possible to recompute the list
             * this is only for aesthetics
             * even without recomputation the list will still be valid
             *
             * @param {Boolean} forceRecompute
             *
             * @return {Array}
             */
            getModulesList: function(forceRecompute) {
                var loaderModules = currentLoader.modules,
                    moduleName;

                if (forceRecompute) {
                    currentLoader.resetModulesList();

                    for (moduleName in loaderModules) {
                        hasOwnProp(loaderModules, moduleName) && currentLoader.pushModule(moduleName);
                    }
                }

                return currentLoader.list;
            },

            getModuleConfig: loaderManagerGetModuleConfig,

            getModuleHook: loaderManagerGetModuleHook,

            listenFor: loaderManagerListenFor,

            register: function(properties, factory) {
                currentLoader.register(properties, factory);
            }
        };
    })();

    LoaderManager.addCoreModule(rootModule, undef, Object);

    LoaderManager.addCoreModule('System', {
        bundle: ['HtmlDebugger']
    }, systemSetup);

    LoaderManager.addCoreModule('jar', {
        bundle: ['async.*', 'feature.*', 'html.*', 'lang.*', 'util.*']
    }, function() {
        /**
         * @access private
         *
         * @namespace jar
         * 
         * @memberof JAR
         * @inner
         */
        var jar = {
            /**
             *
             * @param {(Object|Array|String)} moduleNames
             *
             * @return {*}
             */
            useAll: function(moduleNames) {
                var idx = 0,
                    hooks = [],
                    moduleCount;

                moduleNames = lxNormalize(moduleNames);
                moduleCount = moduleNames.length;

                for (; idx < moduleCount; idx++) {
                    hooks.push(jar.use(moduleNames[idx]));
                }

                return hooks;
            },
            /**
             *
             * @param {String} moduleName
             *
             * @return {*}
             */
            use: LoaderManager.getModuleHook,
            /**
             *
             * @param {(Object|Array|String)} moduleNames
             * @param {function()} callback
             * @param {function(string)} errback
             * @param {function(string)} progressback
             */
            lazyImport: function(moduleNames, callback, errback, progressback) {
                var hooks = [],
                    hook, counter, moduleCount;

                moduleNames = lxNormalize(moduleNames);
                counter = moduleCount = moduleNames.length;

                sxIsFunction(progressback) || (progressback = undef);

                LoaderManager.listenFor(moduleNames, function publishLazy(moduleName, pluginData) {
                    hook = sxIsSet(pluginData) ? pluginData : jar.use(moduleName);
                    hooks.push(hook);

                    counter--;

                    progressback && progressback(hook, Number((1 - counter / moduleCount).toFixed(2)));

                    counter || callback.apply(null, hooks);
                }, errback);
            },
            /**
             *
             * @param {String} option
             *
             * @return {*}
             */
            getConfig: function(option) {
                var transforms = configTransforms[option],
                    value = configs[option],
                    getConfig;

                if (transforms) {
                    getConfig = transforms.get;
                }

                return sxIsFunction(getConfig) ? getConfig(value, transforms.log) : value;
            },

            getModuleName: LoaderManager.getCurrentModuleName
        };

        return jar;
    });

    global.JAR = (function jarSetup() {
        var jarLog = System.getCustomLog('JAR'),
            IMPORT_IDLE = 0,
            IMPORT_STARTED = 1,
            IMPORT_PENDING = 2,
            importStatus = IMPORT_IDLE,
            globalQueue = [],
            globalCounter = 0,
            baseUrl = './',
            scripts = SourceManager.getScripts(),
            idx = scripts.length - 1,
            isAborted, lastAbortedModule, mainScript, JAR;

        /**
         * @namespace JAR
         * @property {String} version
         * 
         * @borrows JAR~jarMain as main
         * @borrows JAR~jarImport as $import
         * @borrows JAR~configure as jarConfigure
         * @borrows JAR~jarAddConfigTransforms as addConfigTransforms
         * @borrows LoaderManager.register as register
         * @borrows LoaderManager.getModulesList as getModulesList
         */
        JAR = {
            main: jarMain,

            $import: jarImport,

            register: LoaderManager.register,

            configure: jarConfigure,

            addConfigTransforms: jarAddConfigTransforms,

            getModulesList: LoaderManager.getModulesList,
            /**
             * @memberof JAR
             *
             * @return {Object}
             */
            noConflict: function() {
                global.JAR = previousJAR;

                return JAR;
            },

            version: '0.2.0'
        };

        /**
         * @access private
         * 
         * @memberof JAR
         * @inner
         *
         */
        function onImport() {
            globalCounter--;

            if (!globalCounter) {
                while (globalQueue.length) {
                    globalQueue.shift()[0]();
                }
            }
        }

        /**
         * @access private
         * 
         * @memberof JAR
         * @inner
         *
         * @param {String} abortedModuleName
         */
        function onAbort(abortedModuleName) {
            isAborted = true;
            lastAbortedModule = abortedModuleName;

            globalCounter = 0;

            while (globalQueue.length) {
                globalQueue.shift()[1](abortedModuleName);
            }
        }

        /**
         * @access private
         * 
         * @memberof JAR
         * @inner
         *
         * @param {String} abortedModuleName
         */
        function globalErrback(abortedModuleName) {
            jarLog('import of "' + abortedModuleName + '" failed!');
            importStatus = IMPORT_IDLE;
        }

        function getRootModule() {
            return LoaderManager.getModuleHook(rootModule);
        }

        /**
         * @access public
         * 
         * @memberof JAR
         * @inner
         *
         * @param {(Object|String)} config
         * @param {*} value
         */
        function jarConfigure(config, value) {
            var option, transforms, setConfig, log;

            if (sxIsString(config)) {
                transforms = configTransforms[config];

                if (transforms) {
                    setConfig = transforms.set;
                    log = transforms.log;
                }

                configs[config] = sxIsFunction(setConfig) ? setConfig(value, configs[config], log) : value;
            }
            else if (sxIsObject(config)) {
                for (option in config) {
                    hasOwnProp(config, option) && jarConfigure(option, config[option]);
                }
            }
        }

        /**
         * @access public
         * 
         * @memberof JAR
         * @inner
         *
         * @param {function(this:root)} main
         * @param {function(string)} errback
         */
        function jarMain(main, errback) {
            var root = getRootModule();

            errback = sxIsFunction(errback) ? errback : globalErrback;

            function callback() {
                if (configs.supressErrors) {
                    try {
                        jarLog('start executing main...');
                        main.call(root);
                    }
                    catch (e) {
                        jarLog((e.stack || e.message || '\n\tError in JavaScript-code: ' + e) + '\nexiting...', 'error');
                    }
                    finally {
                        jarLog('...done executing main');
                    }
                }
                else {
                    main.call(root);
                }
            }

            if (isAborted) {
                errback(lastAbortedModule);
            }
            else if (!globalCounter) {
                callback();
            }
            else {
                globalQueue.push([callback, errback]);
            }
        }

        /**
         * @access public
         * 
         * 
         * @memberof JAR
         * @inner
         *
         * @param {(String|Object|Array)} moduleData
         */
        function jarImport(moduleData) {
            var moduleNames;

            if (isAborted) {
                isAborted = false;
                lastAbortedModule = undef;
            }

            // TODO
            if (sxIsString(moduleData)) {
                moduleNames = (LoaderManager.getModuleConfig(moduleData, 'bundle') || []).slice();
                moduleData === rootModule || moduleNames.unshift(moduleData);
            }
            else {
                moduleNames = lxNormalize(moduleData);
            }

            if (importStatus === IMPORT_IDLE) {
                importStatus = IMPORT_STARTED;
                jarLog('started import "' + moduleNames.join(separator) + '"...');
            }
            else {
                jarLog('added import "' + moduleNames.join(separator) + '" to queue...');
            }

            globalCounter += moduleNames.length;

            LoaderManager.listenFor(moduleNames, onImport, onAbort);

            if (importStatus === IMPORT_STARTED) {
                importStatus = IMPORT_PENDING;

                jarMain(function mainStart() {
                    jarLog('...done importing.');
                    jarLog('waiting for new import...');
                    importStatus = IMPORT_IDLE;
                });
            }
        }

        /**
         * @access public
         * 
         * @memberof JAR
         * @inner
         *
         * @param {(Object|String)} config
         * @param {(Object|Function)} transforms
         */
        function jarAddConfigTransforms(config, transforms) {
            var option;

            if (sxIsString(config) && !hasOwnProp(configTransforms, config)) {
                if (sxIsFunction(transforms)) {
                    transforms = {
                        set: transforms
                    };
                }

                if (sxIsObject(transforms)) {
                    transforms.log = System.getCustomLog('Config#' + config);

                    configTransforms[config] = transforms;

                    jarConfigure(config, configs[config]);
                }
            }
            else if (sxIsObject(config)) {
                for (option in config) {
                    hasOwnProp(config, option) && jarAddConfigTransforms(option, config[option]);
                }
            }
        }

        function exposeModulesGlobal(expose) {
            if (expose) {
                JAR.mods = getRootModule();
            }
        }

        jarAddConfigTransforms({
            debugMode: function(mode) {
                return mode || 'console';
            },
            /**
             *
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
             *
             * @param {Number} timeout
             *
             * @return {Number}
             */
            timeout: function(timeout) {
                timeout = Number(timeout);

                return timeout > 0 ? timeout : 1;
            },
            /**
             *
             * @param {String} mainScript
             * @param {String} oldMainScript
             *
             * @return {String}
             */
            main: function(mainScript, oldMainScript) {
                return oldMainScript || (mainScript && SourceManager.addScript('jar', mainScript + '.js'));
            },

            modules: {
                set: function(moduleConfigs, oldModuleConfigs) {
                    return LoaderManager.setModuleConfig(moduleConfigs, oldModuleConfigs);
                },
                /**
                 * 
                 * @return {Object}
                 */
                get: function() {
                    return LoaderManager.getModuleConfig(LoaderManager.getCurrentModuleName(), 'config') || {};
                }
            },
            /**
             *
             * @param {Object} environments
             * @param {Object} oldEnvironments
             *
             * @return {Object}
             */
            environments: function(environments, oldEnvironments) {
                var environment;

                for (environment in environments) {
                    if (hasOwnProp(environments, environment)) {
                        oldEnvironments[environment] = environments[environment];
                    }
                }

                return oldEnvironments;
            },
            /**
             *
             * @param {String} environment
             * @param {String} oldEnvironment
             *
             * @return {String}
             */
            environment: function(environment, oldEnvironment) {
                var envCallback = configs.environments[environment];

                if (environment !== oldEnvironment && sxIsFunction(envCallback)) {
                    envCallback(jarConfigure);
                }

                return environment;
            },

            context: function(context, oldContext, log) {
                context = LoaderManager.setContext(context);
                log('switching loaderContext from ' + oldContext + ' to ' + context);

                exposeModulesGlobal(configs.globalAccess);

                return context;
            },
            /**
             *
             * @param {Boolean} parse
             * @param {Boolean} isParsed
             * @param {function(string, string)} log 
             *
             * @return {Boolean}
             */
            parseOnLoad: function(parse, isParsed, log) {
                var jar = LoaderManager.getModuleHook('jar');

                if (!isParsed && parse === true) {
                    globalCounter++;

                    jar.lazyImport('jar.html.Parser', function(Parser) {
                        log('start autoparsing document...');
                        Parser.parseDocument();
                        log('...end autoparsing document');
                        onImport();
                    }, globalErrback);
                }

                return isParsed || parse;
            }
        });

        jarConfigure('environments', {
            production: function() {
                jarConfigure({
                    debug: false,

                    modules: {
                        minified: true
                    },

                    globalAccess: false
                });
            },

            development: function() {
                jarConfigure({
                    debug: true,

                    modules: {
                        minified: false
                    },

                    globalAccess: true
                });
            }
        });

        for (; idx > -1; idx--) {
            mainScript = scripts[idx].getAttribute('data-main');

            if (mainScript) {
                baseUrl = mainScript.substring(0, mainScript.lastIndexOf(slash)) || baseUrl;

                jarConfigure('main', mainScript);
                break;
            }
        }

        jarConfigure('modules', {
            baseUrl: baseUrl
        });

        global.jarconfig && jarConfigure(global.jarconfig);

        return JAR;
    })();

})(this);