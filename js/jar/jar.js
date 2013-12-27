(function globalSetup(global, undef) {
    'use strict';

    var globalModule = '*',
        separator = '", "',
        slash = '/',
        object = {},
        toString = object.toString,
        hasOwn = object.hasOwnProperty,
        Root = {},
        ConfigTransforms = {},
        previousJAR = global.JAR,
        System, SourceManager, Config, Loader, JAR, jar, lxRegister, lxNormalize, lxGetModuleHook, lxListenFor, sxIsObject, sxIsFunction, sxIsArray, sxIsString, sxIsSet;

    function noop() {}

    function hasOwnProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    Config = {
        modules: {},
        cache: true,
        debug: false,
        debugMode: 'console',
        environment: '',
        environments: {},
        globalAccess: false,
        parseOnLoad: false,
        supressErrors: false,
        timeout: 5
    };

    System = (function systemSetup() {
        var Debuggers = {},
            types = ['Null', 'Undefined', 'String', 'Number', 'Boolean', 'Array', 'Arguments', 'Object', 'Function', 'Date', 'RegExp'],
            idx = 0,
            nothing = null,
            typesLen = types.length,
            typeLookup = {},
            rTemplateKey = /\{\{(.*?)\}\}/g,
            System, isArgs;

        /**
         *
         * @param {*} data
         * @param {String} type
         */
        function out(data, type, logContext) {
            var Debugger = (Debuggers[Config.debugMode] || Debuggers.console),
                output = Debugger[type] || Debugger.log;

            if (Config.debug && sxIsFunction(output)) {
                output(data, logContext);
            }
        }

        /**
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        function isSet(value) {
            return value != nothing;
        }

        /**
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

        function replacer(match, key) {
            return replacer.values[key] || 'UNKNOWN';
        }

        /**
         *
         * @param {String} mode
         * @param {Function} debuggerSetup
         */
        function addDebugger(mode, debuggerSetup) {
            if (!hasOwnProp(Debuggers, mode) && sxIsFunction(debuggerSetup)) {
                Debuggers[mode] = debuggerSetup();
            }
        }

        System = {
            getType: getType,

            isNaN: isNaN,

            isFinite: isFinite,

            out: out,

            getCustomLogger: function(logContext, templates) {
                templates = templates || {};

                return function(data, type, values) {
                    data = templates[data] || data;

                    if (sxIsObject(values) && sxIsString(data)) {
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
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        System.isArrayLike = function(value) {
            return sxIsArray(value) || System.isArguments(value);
        };
        /**
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        System.isDefined = function(value) {
            return !System.isUndefined(value);
        };
        /**
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

            if (sxIsArray(Class)) {
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

        sxIsObject = System.isObject;
        sxIsFunction = System.isFunction;
        sxIsArray = System.isArray;
        sxIsString = System.isString;
        sxIsSet = isSet;

        addDebugger('console', function consoleDebuggerSetup() {
            var console = global.console,
                canUseGroups = console.group && console.groupEnd,
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
                return function logger(data, logContext) {
                    if (canUseGroups && Config.debugGroup) {
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

                    return global.console[method](data);
                };
            }

            return pseudoConsole;
        });

        return System;
    })();

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
            return Config.cache ? '' : ('?_=' + new Date().getTime());
        }

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

            script.id = 'js:' + moduleName;
            script.type = 'text/javascript';
            script.src = path + getTimeStamp();
            script.async = true;

            head.appendChild(script);
            scripts[moduleName] = script;
        }

        /**
         *
         * @param {String} moduleName
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
         * @return {Object}
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

    Loader = (function loaderSetup() {
        var loaderModules = {},
            moduleQueues = {},
            rBundleRequest = /\.\*$/,
            rPlugin = /!/,
            rLeadingDot = /^\./,
            /**
             *
             */
            MSG_BUNDLE_ALREADY_LOADED = 0,
            /**
             * @const
             * @type {number}
             */
            MSG_BUNDLE_ALREADY_LOADING = 1,
            /**
             * @const
             * @type {number}
             */
            MSG_BUNDLE_FOUND = 2,
            /**
             * @const
             * @type {number}
             */
            MSG_BUNDLE_LOADED = 3,
            /**
             * @const
             * @type {number}
             */
            MSG_BUNDLE_LOADING = 4,
            /**
             * @const
             * @type {number}
             */
            MSG_BUNDLE_NOT_DEFINED = 5,
            /**
             * @const
             * @type {number}
             */
            MSG_BUNDLE_REQUESTED = 6,
            /**
             * @const
             * @type {number}
             */
            MSG_DEPENDENCIES_FOUND = 7,
            /**
             * @const
             * @type {number}
             */
            MSG_DEPENDENCY_FOUND = 8,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_ALREADY_LOADED = 9,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_ALREADY_LOADED_MANUAL = 10,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_ALREADY_LOADING = 11,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_ALREADY_REGISTERED = 12,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_LOADED = 13,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_LOADED_MANUAL = 14,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_LOADING = 15,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_NAME_INVALID = 16,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_RECOVERING = 17,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_REGISTERING = 18,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_REQUESTED = 19,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_SUBSCRIBED = 20,
            /**
             * @const
             * @type {number}
             */
            MSG_MODULE_PUBLISHED = 21,
            /**
             * @const
             * @type {number}
             */
            MSG_TIMEOUT = 22,
            /**
             * @const
             * @type {number}
             */
            MSG_PLUGIN_NOT_FOUND = 23,
            // Module states
            /**
             * @const
             * @type {number}
             */
            MODULE_WAITING = 1,
            /**
             * @const
             * @type {number}
             */
            MODULE_LOADING = 2,
            /**
             * @const
             * @type {number}
             */
            MODULE_LOADED = 3,
            /**
             * @const
             * @type {number}
             */
            MODULE_REGISTERED = 4,
            /**
             * @const
             * @type {number}
             */
            MODULE_LOADED_MANUAL = 5,

            // Bundle states
            /**
             * @const
             * @type {number}
             */
            MODULE_BUNDLE_WAITING = 0,
            /**
             * @const
             * @type {number}
             */
            MODULE_BUNDLE_LOADING = 1,
            /**
             * @const
             * @type {number}
             */
            MODULE_BUNDLE_LOADED = 2,
            Loader, Module, sortedModulesList, alreadySortedModules, currentModuleName, messageStates, loaderNormalize, loaderLogMessage, loaderImport;

        /**
         *
         * @param {String} messageType
         * @param {String} moduleName
         * @param {Object} values
         */
        loaderLogMessage = (function loaderLogMessageSetup() {
            var messageTemplates = [],
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
                loaderLogger;

            function replaceWhat(message, what) {
                return message.replace('{{what}}', what + ' "{{mod}}"');
            }

            function replaceModule(message) {
                return replaceWhat(message, module);
            }

            function replaceBundle(message) {
                return replaceWhat(message, bundle);
            }

            function replaceWhy(message, why) {
                return message.replace('{{why}}', why);
            }

            function replaceAlreadyLoaded(message) {
                return replaceWhy(message, alreadyLoaded);
            }

            function replaceAlreadyLoading(message) {
                return replaceWhy(message, alreadyLoading);
            }

            messageTemplates[MSG_BUNDLE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadBundle);
            messageTemplates[MSG_BUNDLE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadBundle);
            messageTemplates[MSG_BUNDLE_FOUND] = replaceBundle('found bundlemodules "{{bundle}}" for {{what}}');
            messageTemplates[MSG_BUNDLE_LOADED] = replaceBundle(endLoad);
            messageTemplates[MSG_BUNDLE_LOADING] = replaceBundle(startLoad);
            messageTemplates[MSG_BUNDLE_NOT_DEFINED] = replaceWhy(attemptLoadBundle, 'bundle is not defined');
            messageTemplates[MSG_BUNDLE_REQUESTED] = replaceBundle(requested);

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

            loaderLogger = System.getCustomLogger('Loader', messageTemplates);

            function loaderLogMessage(messageType, moduleName, values) {
                var logType = messageStates[messageType] || 'log';

                values = values || {};
                values.mod = moduleName;

                loaderLogger(messageType, logType, values);
            }

            return loaderLogMessage;
        })();

        messageStates = (function messageStateSetup() {
            var messageStates = {};

            function setStateForMessages(messages, state) {
                var idx = 0,
                    messagesLen = messages.length;

                for (; idx < messagesLen; idx++) {
                    messageStates[messages[idx]] = state;
                }
            }

            setStateForMessages([
            MSG_MODULE_NAME_INVALID,
            MSG_PLUGIN_NOT_FOUND,
            MSG_TIMEOUT], 'error');

            setStateForMessages([
            MSG_BUNDLE_ALREADY_LOADED,
            MSG_BUNDLE_ALREADY_LOADING,
            MSG_BUNDLE_NOT_DEFINED,
            MSG_MODULE_ALREADY_LOADED,
            MSG_MODULE_ALREADY_LOADING,
            MSG_MODULE_ALREADY_LOADED_MANUAL,
            MSG_MODULE_ALREADY_REGISTERED], 'warn');

            return messageStates;
        })();

        Module = (function moduleSetup() {
            /**
             *
             * @constructor
             * @param {String} moduleName
             */
            function Module(moduleName) {
                var module = this,
                    implizitDependency = loaderExtractModuleName(moduleName),
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
                depsCounter: 0,

                bundleCounter: 0,

                setWaiting: function() {
                    this.state = MODULE_WAITING;
                },

                isState: function(state) {
                    return this.state === state;
                },

                setState: function(state) {
                    this.state = state;
                },

                isRegistered: function() {
                    return this.state === MODULE_REGISTERED || this.isState(MODULE_LOADED) || this.isState(MODULE_LOADED_MANUAL);
                },

                isBundleState: function(bundleState) {
                    return this.bundleState === bundleState;
                },

                setBundleState: function(bundleState) {
                    this.bundleState = bundleState;
                },

                unsetBundleLoading: function() {
                    var module = this;

                    if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                        module.bundleState = MODULE_BUNDLE_WAITING;

                        module.dep && loaderGetModule(module.dep).unsetBundleLoading();
                    }
                },

                setBundleLoaded: function() {
                    var module = this,
                        bundleName = module.name + '.*',
                        messageID = module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED;

                    module.bundleState = MODULE_BUNDLE_LOADED;

                    loaderLogMessage(messageID, bundleName);

                    loaderNotify(bundleName);
                },

                getFullPath: function(fileType) {
                    var module = this,
                        moduleName = module.name,
                        keyDirPath = 'dirPath',
                        keyFileName = 'fileName',
                        dirPath = loaderGetModuleConfig(moduleName, keyDirPath) || module[keyDirPath],
                        fileName = loaderGetModuleConfig(moduleName, keyFileName) || module[keyFileName],
                        fullPath;

                    fullPath = loaderGetModuleConfig(moduleName, 'baseUrl') + dirPath + fileName;

                    if (fileType == 'js') {
                        fullPath += loaderGetModuleConfig(moduleName, 'versionSuffix') + loaderGetModuleConfig(moduleName, 'minified');
                    }

                    fullPath += '.' + fileType;

                    return fullPath;
                },

                depsReady: function() {
                    var module = this,
                        moduleName = module.name;

                    if (module.isRegistered() && !module.isState(MODULE_LOADED)) {
                        module.hookUp();

                        module.setState(MODULE_LOADED);
                        loaderLogMessage(MSG_MODULE_LOADED, moduleName);
                        loaderNotify(moduleName);
                    }
                },

                bundleReady: function() {
                    var module = this,
                        bundleName = module.name + '.*',
                        messageID = module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED;

                    if (!module.isBundleState(MODULE_BUNDLE_LOADED)) {
                        module.setBundleState(MODULE_BUNDLE_LOADED);

                        module.bundleState = MODULE_BUNDLE_LOADED;

                        loaderLogMessage(messageID, bundleName);

                        loaderNotify(bundleName);
                    }
                },

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
                        loaderLogMessage(MSG_MODULE_SUBSCRIBED, moduleName, {
                            subs: moduleNames.join(separator)
                        });

                        loaderListenFor(moduleNames, function onModuleLoaded(publishingModuleName, pluginData) {
                            loaderLogMessage(MSG_MODULE_PUBLISHED, moduleName, {
                                pub: publishingModuleName
                            });

                            if (sxIsSet(pluginData)) {
                                module.pluginData[publishingModuleName] = pluginData;
                            }

                            --module[moduleCounter] || module[moduleReady]();
                        }, function onModuleAborted() {
                            asBundle ? module.unsetBundleLoading() : loaderAbort(moduleName);
                        });
                    }
                },

                hookUp: function() {
                    var module = this,
                        factory = module.factory,
                        depHooks = [],
                        idx = 0,
                        implizitDependency = module.dep,
                        dependencies = module.deps,
                        depLen = dependencies ? dependencies.length : 0,
                        hook = implizitDependency ? loaderGetModuleHook(implizitDependency) : Root,
                        dependencyName, pluginData;

                    for (; idx < depLen; idx++) {
                        dependencyName = dependencies[idx];
                        pluginData = module.pluginData[dependencyName];
                        depHooks.push(pluginData ? pluginData : loaderGetModuleHook(dependencyName));
                    }

                    loaderSetCurrentModuleName(module.name);

                    module.hook = hook[module.fileName] = sxIsFunction(factory) ? factory.apply(hook, depHooks) : factory || {};

                    loaderSetCurrentModuleName();
                }
            };

            return Module;
        })();

        /**
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        function loaderExtractModuleName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf('.'));
        }

        /**
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        function loaderExtractPluginModuleName(moduleName) {
            return moduleName.split(rPlugin)[0];
        }

        /**
         *
         * @param {String} moduleName
         *
         * @return {Boolean}
         */
        function loaderIsBundleRequest(moduleName) {
            return rBundleRequest.test(moduleName);
        }

        /**
         *
         * @param {String} moduleName
         *
         * @return {Boolean}
         */
        function loaderIsPluginRequest(moduleName) {
            return rPlugin.test(moduleName);
        }

        /**
         *
         * @param {String} moduleName
         *
         * @return {Module}
         */
        function loaderGetModule(moduleName) {
            var extractedName = loaderIsBundleRequest(moduleName) ? loaderExtractModuleName(moduleName) : loaderIsPluginRequest(moduleName) ? loaderExtractPluginModuleName(moduleName) : moduleName,
                module = loaderModules[extractedName] = (loaderModules[extractedName] || new Module(extractedName));

            return module;
        }

        /**
         *
         * @param {String} moduleName
         *
         * @return {*}
         */
        function loaderGetModuleHook(moduleName) {
            return loaderGetModule(moduleName).hook;
        }

        /**
         *
         * @param {String} moduleName
         */
        loaderImport = (function loaderImportSetup() {
            function loaderImport(moduleName) {
                var $import = loaderIsBundleRequest(moduleName) ? loaderImportBundle : loaderImportModule;

                $import(moduleName);
            }

            function loaderImportModule(moduleName) {
                var module = loaderGetModule(moduleName),
                    messageID;

                loaderLogMessage(MSG_MODULE_REQUESTED, moduleName);

                if (module.isState(MODULE_WAITING)) {
                    loaderImportImplizitDependency(moduleName);

                    loaderLogMessage(MSG_MODULE_LOADING, moduleName);

                    module.setState(MODULE_LOADING);

                    module.timeoutID = global.setTimeout(function abortModule() {
                        loaderAbort(moduleName);
                    }, (Config.timeout) * 1000);

                    SourceManager.addScript(moduleName, module.getFullPath('js'));
                }
                else {
                    messageID = module.isState(MODULE_LOADED) ? MSG_MODULE_ALREADY_LOADED : module.isState(MODULE_LOADED_MANUAL) ? MSG_MODULE_ALREADY_LOADED_MANUAL : MSG_MODULE_ALREADY_LOADING;

                    loaderLogMessage(messageID, moduleName);
                }
            }

            function loaderImportBundle(bundleName) {
                var module = loaderGetModule(bundleName),
                    messageID;

                loaderLogMessage(MSG_BUNDLE_REQUESTED, bundleName);

                if (module.isBundleState(MODULE_BUNDLE_LOADED)) {
                    messageID = MSG_BUNDLE_ALREADY_LOADED;
                }
                else if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                    messageID = MSG_BUNDLE_ALREADY_LOADING;
                }
                else {
                    loaderListenFor([module.name], loaderImportBundleForModule);

                    messageID = MSG_BUNDLE_LOADING;
                }

                loaderLogMessage(messageID, bundleName);
            }

            function loaderImportBundleForModule(moduleName) {
                var module = loaderGetModule(moduleName);

                if (!(module.isBundleState(MODULE_BUNDLE_LOADING) || module.isBundleState(MODULE_BUNDLE_LOADED))) {
                    module.setBundleState(MODULE_BUNDLE_LOADING);

                    module.listenFor(module.bundle, true);
                }
            }

            return loaderImport;
        })();

        function loaderImportImplizitDependency(moduleName) {
            var module = loaderGetModule(moduleName),
                implizitDependency = module.dep;

            if (implizitDependency) {
                loaderLogMessage(MSG_DEPENDENCY_FOUND, moduleName, {
                    dep: implizitDependency
                });

                module.listenFor([implizitDependency]);
            }
        }

        /**
         * 
         * @param {Array} moduleNames
         * @param {function(string)} callback
         * @param {function(string)} errback
         */
        function loaderListenFor(moduleNames, callback, errback) {
            var idx = 0,
                pluginArgs = {},
                moduleCount = moduleNames.length,
                pluginParts,
                moduleName, module, queue, onModuleLoaded;

            function onPluginModuleLoaded(pluginName) {
                var data = pluginArgs[pluginName],
                    pluginModule = loaderGetModuleHook(pluginName);

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
                    loaderLogMessage(MSG_PLUGIN_NOT_FOUND, pluginName, {
                        data: data
                    });

                    errback(pluginName);
                }
            }

            for (; idx < moduleCount; idx++) {
                moduleName = moduleNames[idx];

                if (loaderIsPluginRequest(moduleName)) {
                    pluginParts = moduleName.split(rPlugin);
                    moduleName = pluginParts.shift();
                    pluginArgs[moduleName] = pluginParts.join('!');
                    onModuleLoaded = onPluginModuleLoaded;
                }
                else {
                    onModuleLoaded = callback;
                }

                queue = moduleQueues[moduleName] = moduleQueues[moduleName] || [];

                loaderImport(moduleName);

                module = loaderGetModule(moduleName);

                if (!module.isState(MODULE_LOADED) || (loaderIsBundleRequest(moduleName) && !module.isBundleState(MODULE_BUNDLE_LOADED))) {
                    queue.push([onModuleLoaded, errback]);
                }
                else {
                    onModuleLoaded(moduleName);
                }
            }
        }

        /**
         * 
         * @param {Object<string, *>} properties
         * @param {function()} factory
         */
        function loaderRegister(properties, factory) {
            var moduleName = properties.MID,
                autoRegisterLevel = properties.autoRegLvl,
                module = loaderGetModule(moduleName),
                implizitDependency = module.dep,
                bundle, dependencies;

            if (!module.isRegistered()) {
                loaderLogMessage(MSG_MODULE_REGISTERING, moduleName);

                module.factory = factory;

                if (autoRegisterLevel > 0 && implizitDependency) {
                    loaderAbort(implizitDependency, true);

                    loaderRegister({
                        MID: implizitDependency,
                        autoRegLvl: --autoRegisterLevel
                    });
                }

                if (module.isState(MODULE_LOADING)) {
                    global.clearTimeout(module.timeoutID);
                    module.setState(MODULE_REGISTERED);
                }
                else {
                    loaderLogMessage(MSG_MODULE_LOADED_MANUAL, moduleName);

                    module.setState(MODULE_LOADED_MANUAL);

                    implizitDependency && loaderImportImplizitDependency(moduleName);
                }

                if (properties.styles) {
                    SourceManager.addStyleSheet(moduleName, module.getFullPath('css'));
                }

                bundle = loaderNormalize(properties.bundle, moduleName, true);

                dependencies = loaderNormalize(properties.deps, moduleName);

                module.deps = dependencies;
                module.bundle = bundle;

                if (dependencies.length) {
                    loaderLogMessage(MSG_DEPENDENCIES_FOUND, moduleName, {
                        deps: dependencies.join(separator)
                    });
                }

                module.listenFor(dependencies);

                if (bundle.length) {
                    loaderLogMessage(MSG_BUNDLE_FOUND, moduleName, {
                        bundle: bundle.join(separator)
                    });
                }
            }
            else {
                loaderLogMessage(MSG_MODULE_ALREADY_REGISTERED, moduleName);
            }
        }

        /**
         * 
         * @param {String} moduleName
         */
        function loaderNotify(moduleName) {
            var queue = moduleQueues[moduleName];

            loaderPushModule(moduleName);

            if (queue) {
                while (queue.length) {
                    queue.shift()[0](moduleName);
                }
            }
        }

        /**
         *
         * @param {String} moduleName
         * @param {Boolean} silent
         */
        function loaderAbort(moduleName, silent) {
            var module = loaderGetModule(moduleName),
                queue = (moduleQueues[moduleName] || []).concat(moduleQueues[moduleName + '.*'] || []),
                errback, path;

            if (module.isState(MODULE_LOADING)) {
                path = SourceManager.removeScript(moduleName);

                if (!silent) {
                    loaderLogMessage(MSG_TIMEOUT, moduleName, {
                        path: path,
                        sec: Config.timeout
                    });

                    module.setWaiting();

                    if (!loaderFindRecover(moduleName)) {
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
        function loaderFindRecover(moduleName) {
            var module = loaderGetModule(moduleName),
                foundRecover,
                recoverModuleName,
                recoverModuleDependency;

            foundRecover = loaderGetModuleConfig(moduleName, 'recover', module.nextRecover);

            if (foundRecover) {
                recoverModuleName = foundRecover.restrict;

                // This is a recover on a higher level
                if (recoverModuleName !== moduleName) {
                    // extract the next recovermodule
                    recoverModuleDependency = loaderGetModule(recoverModuleName).dep;
                    module.nextRecover = recoverModuleDependency ? recoverModuleDependency + '.*' : undef;

                    // Only recover this module
                    foundRecover.restrict = moduleName;
                }

                JAR.configure('modules', foundRecover);

                // Restore module recover assoziation
                foundRecover.restrict = recoverModuleName;

                loaderLogMessage(MSG_MODULE_RECOVERING, moduleName);

                loaderImport(moduleName);
            }
            else {
                delete module.nextRecover;
            }

            return !!foundRecover;
        }

        /**
         *
         * @param {(String|Array|Object)} modules
         * @param {String} ref
         * @param {Boolean} isRootRef
         *
         * @return {Array}
         */
        loaderNormalize = (function loaderNormalizeSetup() {
            function normalizeArray(modules, ref, isRootRef) {
                var normalizedModules = [],
                    idx = 0,
                    moduleCount = modules.length;

                for (; idx < moduleCount; idx++) {
                    normalizedModules = normalizedModules.concat(normalize(modules[idx], ref, isRootRef));
                }

                return normalizedModules;
            }

            function normalizeObject(modules, ref, isRootRef) {
                var normalizedModules = [],
                    tmpRef;

                for (tmpRef in modules) {
                    if (hasOwnProp(modules, tmpRef)) {
                        normalizedModules = normalizedModules.concat(normalize(modules[tmpRef], tmpRef, true));
                    }
                }

                return normalizeArray(normalizedModules, ref, isRootRef);
            }

            /**
             *
             * @param {String} moduleName
             * @param {String} ref
             * @param {Boolean} isRootRef
             *
             * @return {Array}
             */
            function normalizeString(moduleName, ref, isRootRef) {
                var dot = '.',
                    normalizedModules = [];

                if (moduleName) {
                    if (ref && isRootRef) {
                        if (moduleName === dot) {
                            moduleName = dot = '';
                        }
                        else if (!ref.replace(/\./g, '')) {
                            dot = '';
                        }

                        moduleName = ref + dot + moduleName;
                    }
                    else {
                        while (ref && rLeadingDot.test(moduleName)) {
                            moduleName = moduleName.replace(rLeadingDot, '');
                            ref = loaderExtractModuleName(ref) || undef;
                            isRootRef = !! ref;
                        }

                        isRootRef && (moduleName = normalizeString(moduleName || dot, ref, isRootRef)[0]);
                    }

                    if (rLeadingDot.test(moduleName) && !isRootRef) {
                        loaderLogMessage(MSG_MODULE_NAME_INVALID, moduleName);
                    }
                    else {
                        normalizedModules = [moduleName];
                    }
                }

                return normalizedModules;
            }

            function normalize(modules, ref, isRootRef) {
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

                return normalizer ? normalizer(modules, ref, isRootRef) : [];
            }

            return normalize;
        })();

        /**
         *
         * @param {String} moduleName
         * @param {String} info
         *
         * @return {String}
         */
        function loaderGetModuleConfig(moduleName, option, skipUntil) {
            var moduleConfigs = Config.modules,
                nextLevel = moduleName,
                skip = false,
                result;

            do {
                if (!skip && moduleConfigs[moduleName]) {
                    result = moduleConfigs[moduleName][option];
                }

                if (nextLevel) {
                    moduleName = nextLevel + '.*';
                    nextLevel = loaderExtractModuleName(nextLevel);
                }
                else {
                    moduleName = moduleName !== globalModule ? globalModule : undef;
                }

                if (skipUntil) {
                    skip = skipUntil !== moduleName;
                    skip || (skipUntil = undef);
                }

            } while (!sxIsSet(result) && moduleName);

            return result || '';
        }

        /**
         *
         * @return {String}
         */
        function loaderGetCurrentModuleName() {
            return currentModuleName || globalModule;
        }

        /**
         *
         * @param {String} moduleName
         */
        function loaderSetCurrentModuleName(moduleName) {
            currentModuleName = moduleName || undef;
        }

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
        function loaderGetModulesList(forceRecompute) {
            var moduleName;

            if (forceRecompute) {
                loaderResetModulesList();

                for (moduleName in loaderModules) {
                    hasOwnProp(loaderModules, moduleName) && loaderPushModule(moduleName);
                }
            }

            return sortedModulesList;
        }

        function loaderResetModulesList() {
            sortedModulesList = [];
            alreadySortedModules = {
                jar: true,
                System: true
            };
        }

        /**
         *
         * @param {Array} modules
         */
        function loaderPushModules(modules) {
            var idx = 0,
                moduleCount;

            moduleCount = modules ? modules.length : 0;

            for (; idx < moduleCount; idx++) {
                loaderPushModule(modules[idx]);
            }
        }

        /**
         *
         * @param {String} moduleName
         */
        function loaderPushModule(moduleName) {
            var isBundleRequested = loaderIsBundleRequest(moduleName),
                module = loaderGetModule(moduleName),
                implizitDependency = module.dep,
                dependencies = (module.deps || []).slice();

            moduleName = module.name;
            implizitDependency && dependencies.unshift(implizitDependency);

            if (module.isState(MODULE_LOADED)) {
                if (!hasOwnProp(alreadySortedModules, moduleName)) {
                    loaderPushModules(dependencies);

                    sortedModulesList.push(module.getFullPath('js'));
                    alreadySortedModules[moduleName] = true;
                }

                if (isBundleRequested) {
                    loaderPushModules(module.bundle);
                }
            }
        }

        loaderResetModulesList();

        lxRegister = loaderRegister;
        lxNormalize = loaderNormalize;
        lxGetModuleHook = loaderGetModuleHook;
        lxListenFor = loaderListenFor;

        Loader = {
            getCurrentModuleName: loaderGetCurrentModuleName,

            getModulesList: loaderGetModulesList
        };

        return Loader;
    })();

    jar = {
        /**
         *
         * @param {(Object|Array|String)} moduleNames
         * @param {function()} callback
         *
         * @return {*}
         */
        use: function(moduleNames, callback) {
            var idx = 0,
                hooks = [],
                moduleCount;

            moduleNames = lxNormalize(moduleNames);
            moduleCount = moduleNames.length;

            for (; idx < moduleCount; idx++) {
                hooks.push(lxGetModuleHook(moduleNames[idx]));
            }

            return sxIsFunction(callback) ? callback.apply(null, hooks) : hooks;
        },
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

            lxListenFor(moduleNames, function publishLazy(moduleName, pluginData) {
                hook = sxIsSet(pluginData) ? pluginData : lxGetModuleHook(moduleName);
                hooks.push(hook);

                counter--;

                progressback && progressback(hook, 1 - counter / moduleCount);

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
            var transforms = ConfigTransforms[option],
                value = Config[option],
                getConfig;

            if (transforms) {
                getConfig = transforms.get;
            }

            return sxIsFunction(getConfig) ? getConfig(value, transforms.logger) : value;
        },

        getModuleName: Loader.getCurrentModuleName
    };

    lxRegister({
        MID: 'System',
        bundle: ['HtmlDebugger']
    }, System);

    lxRegister({
        MID: 'jar',
        bundle: ['async.*', 'feature.*', 'html.*', 'lang.*', 'util.*']
    }, jar);

    JAR = (function jarSetup() {
        var jarLogger = System.getCustomLogger('JAR'),
            importStatus = 'idle',
            globalQueue = [],
            globalCounter = 0,
            baseUrl = './',
            scripts = SourceManager.getScripts(),
            idx = scripts.length - 1,
            JAR, isAborted, lastAbortedModule, mainScript;

        /**
         *
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

        function globalErrback(abortedModuleName) {
            jarLogger('import of "' + abortedModuleName + '" failed!');
            importStatus = 'idle';
        }

        /**
         *
         * @param {(Object|String)} config
         * @param {*} value
         */
        function jarConfigure(config, value) {
            var option, transforms, setConfig, logger;

            if (sxIsString(config)) {
                transforms = ConfigTransforms[config];

                if (transforms) {
                    setConfig = transforms.set;
                    logger = transforms.logger;
                }

                Config[config] = sxIsFunction(setConfig) ? setConfig(value, Config[config], logger) : value;
            }
            else if (sxIsObject(config)) {
                for (option in config) {
                    hasOwnProp(config, option) && jarConfigure(option, config[option]);
                }
            }
        }

        /**
         * 
         *
         *
         * @param {function(this:Root)} main
         * @param {function(string)} errback
         */
        function jarMain(main, errback) {
            errback = sxIsFunction(errback) ? errback : globalErrback;

            function callback() {
                if (Config.supressErrors) {
                    try {
                        jarLogger('start executing main...');
                        main.call(Root);
                    }
                    catch (e) {
                        jarLogger((e.stack || e.message || '\n\tError in JavaScript-code: ' + e) + '\nexiting...', 'error');
                    }
                    finally {
                        jarLogger('...done executing main');
                    }
                }
                else {
                    main.call(Root);
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
         *
         * @param {(String|Object|Array)} moduleData
         */
        function jarImport(moduleData) {
            var moduleNames;

            if (isAborted) {
                isAborted = false;
                lastAbortedModule = undef;
            }

            if (moduleData === globalModule) {
                moduleNames = Config.modules[globalModule].bundle || [];
            }
            else {
                moduleNames = lxNormalize(moduleData);
            }

            if (importStatus === 'idle') {
                importStatus = 'started';
                jarLogger('started import "' + moduleNames.join(separator) + '"...');
            }
            else {
                jarLogger('added import "' + moduleNames.join(separator) + '" to queue...');
            }

            globalCounter += moduleNames.length;

            lxListenFor(moduleNames, onImport, onAbort);

            if (importStatus === 'started') {
                importStatus = 'importing';

                jarMain(function mainStart() {
                    jarLogger('...done importing.');
                    jarLogger('waiting for new import...');
                    importStatus = 'idle';
                });
            }
        }

        /**
         *
         * @param {(Object|String)} config
         * @param {(Object|Function)} transforms
         */
        function jarAddConfigTransforms(config, transforms) {
            var option;

            if (sxIsString(config) && !hasOwnProp(ConfigTransforms, config)) {
                if (sxIsFunction(transforms)) {
                    transforms = {
                        set: transforms
                    };
                }

                if (sxIsObject(transforms)) {
                    ConfigTransforms[config] = transforms;

                    transforms.logger = System.getCustomLogger('Config#' + config);

                    jarConfigure(Config[config]);
                }
            }
            else if (sxIsObject(config)) {
                for (option in config) {
                    hasOwnProp(config, option) && jarAddConfigTransforms(option, config[option]);
                }
            }
        }

        JAR = {
            main: jarMain,

            $import: jarImport,

            register: lxRegister,

            configure: jarConfigure,

            addConfigTransforms: jarAddConfigTransforms,

            getModulesList: Loader.getModulesList,

            noConflict: function() {
                global.JAR = previousJAR;

                return JAR;
            },
            /**
             *
             * @type {String}
             */
            version: '0.2.0'
        };

        jarAddConfigTransforms({
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
                return oldMainScript || SourceManager.addScript('jar', mainScript + '.js');
            },
            /**
             *
             * @param {Boolean} parse
             * @param {Boolean} isParsed
             * @param {function(string, string)} logger 
             *
             * @return {Boolean}
             */
            parseOnLoad: function(parse, isParsed, logger) {
                if (!isParsed && parse === true) {
                    globalCounter++;

                    jar.lazyImport('jar.html.Parser', function(Parser) {
                        logger('start autoparsing document...');
                        Parser.parseDocument();
                        logger('...end autoparsing document');
                        onImport();
                    }, globalErrback);
                }

                return isParsed || parse;
            },
            /**
             *
             * @param {Boolean} makeGlobal
             * @param {Boolean} isGlobal
             *
             * @return {Boolean}
             */
            globalAccess: function(makeGlobal, isGlobal) {
                if (!isGlobal && makeGlobal) {
                    JAR.mods = Root;
                }
                else if (isGlobal && !makeGlobal) {
                    delete JAR.mods;
                }

                return !!makeGlobal;
            },

            modules: (function moduleConfigsTransformSetup() {
                var str = 'String',
                    rEndSlash = /\/$/,
                    propertyDefinitions = {
                        baseUrl: {
                            check: str,

                            transform: addEndSlash
                        },

                        bundle: {
                            check: 'Set',

                            transform: function bundleTransform(props, moduleName) {
                                return lxNormalize(props, moduleName, moduleName !== globalModule);
                            }
                        },

                        config: {
                            check: 'Object'
                        },

                        dirPath: {
                            check: str,

                            transform: addEndSlash
                        },

                        fileName: {
                            check: str
                        },

                        minified: {
                            check: 'Boolean',

                            transform: function minTransform(prop) {
                                return prop ? '.min' : '';
                            }
                        },

                        recover: {
                            check: 'Object',

                            transform: function recoverTransform(props, moduleName) {
                                var recover = {},
                                    prop;

                                for (prop in props) {
                                    hasOwnProp(props, prop) && (recover[prop] = props[prop]);
                                }

                                recover.restrict = moduleName;

                                return recover;
                            }
                        },

                        versionSuffix: {
                            check: str
                        }
                    };

                function addEndSlash(prop) {
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

                return {
                    /**
                     *
                     * @param {(Object|Array)} moduleConfigs
                     * @param {Object<string, object>} oldModuleConfigs
                     *
                     * @return {Object<string, object>}
                     */
                    set: function(moduleConfigs, oldModuleConfigs) {
                        var idx = 0,
                            property, moduleConfigsLen, oldModuleConfig, modules, moduleName, mi, moduleCount;

                        if (sxIsArray(moduleConfigs)) {
                            moduleConfigsLen = moduleConfigs.length;

                            for (; idx < moduleConfigsLen; idx++) {
                                jarConfigure('modules', moduleConfigs[idx]);
                            }
                        }
                        else if (sxIsObject(moduleConfigs)) {
                            modules = lxNormalize(moduleConfigs.restrict || globalModule);
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
                    },
                    /**
                     *
                     * @param {Object} moduleConfigs
                     *
                     * @return {function(string)}
                     */
                    get: function(moduleConfigs) {
                        // TODO maby rethink
                        var modules = {},
                            moduleName;

                        for (moduleName in moduleConfigs) {
                            hasOwnProp(moduleConfigs, moduleName) && (modules[moduleName] = generatePropertiesGetter(moduleConfigs[moduleName]));
                        }

                        function generatePropertiesGetter(moduleConfig) {
                            return function propertyGetter(ruleProperty) {
                                return moduleConfig[ruleProperty];
                            };
                        }

                        return modules;
                    }
                };
            })(),
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
                var envCallback = Config.environments[environment];

                if (environment !== oldEnvironment && sxIsFunction(envCallback)) {
                    envCallback(jarConfigure);
                }

                return environment;
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

    global.JAR = JAR;

})(this);