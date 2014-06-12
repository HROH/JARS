(function globalSetup(global, undef) {
    'use strict';

    var rootModule = '*',
        separator = '", "',
        slash = '/',
        object = {},
        hasOwn = object.hasOwnProperty,
        SourceManager, LoaderManager;

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
    function hasOwnProp(object, prop) {
        return hasOwn.call(object, prop);
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
            scripts = {},
            styleSheets = {},
            createStyleSheet;

        /**
         * @access public
         * 
         * @memberof SourceManager
         * 
         * @return {HTMLCollection}
         */
        function getScripts() {
            return doc.getElementsByTagName('script');
        }

        /**
         * @access public
         * 
         * @memberof SourceManager
         * 
         * @param {String} moduleName
         * @param {String} path
         */
        function addScript(moduleName, path) {
            var script = doc.createElement('script');

            head.appendChild(script);

            script.id = moduleName;
            script.type = 'text/javascript';
            script.src = path;
            script.async = true;

            scripts[moduleName] = script;
        }

        /**
         * @access public
         * 
         * @memberof SourceManager
         * 
         * @param {String} moduleName
         * 
         * @return {Boolean}
         */
        function findScript(moduleName) {
            var script = (doc.currentScript && doc.currentScript.id === moduleName) ? doc.currentScript : doc.getElementById(moduleName),
                foundScript = !! script;

            if (foundScript) {
                script.id += ':loaded';
            }

            return foundScript;
        }

        /**
         * @access public
         * 
         * @memberof SourceManager
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
         * @access private
         * 
         * @memberof SourceManager
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

        /**
         * @access public
         * 
         * @memberof SourceManager
         * 
         * @param {String} moduleName
         * @param {String} path
         */
        function addStyleSheet(moduleName, path) {
            var styleSheet;

            path = path;
            styleSheet = createStyleSheet(path);

            head.insertBefore(styleSheet, head.firstChild);

            styleSheet.id = 'css:' + moduleName;
            styleSheet.setAttribute('type', 'text/css');
            styleSheet.setAttribute('rel', 'stylesheet');
            styleSheet.setAttribute('href', path);
            styleSheets[moduleName] = styleSheet;
        }

        /**
         * @access public
         * 
         * @memberof SourceManager
         * 
         * @param {String} moduleName
         * 
         * @return {String}
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

            findScript: findScript,

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
            loaderConfig = {
                checkCircularDeps: false,

                createDependencyURLList: false,

                context: 'default',

                modules: {
                    restrict: rootModule,

                    cache: false,

                    minified: false,

                    versionSuffix: '',

                    timeout: 5
                }
            },
            loaderCoreModules = {},
            rBundleRequest = /\.\*$/,
            rLeadingDot = /^\./,
            interceptors = {},

            // moduleQueue indices
            QUEUE_SUCCESS = 0,
            QUEUE_ERROR = 1,

            // Loader message indices
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
            MSG_INTERCEPTION_ERROR = 10,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_LOADED = 11,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_LOADED_MANUAL = 12,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_LOADING = 13,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_ALREADY_REGISTERED = 14,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_LOADED = 15,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_LOADED_MANUAL = 16,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_LOADING = 17,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_NAME_INVALID = 18,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_RECOVERING = 19,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_REGISTERING = 20,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_REQUESTED = 21,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_SUBSCRIBED = 22,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_MODULE_PUBLISHED = 23,
            /**
             * @access private
             * 
             * @const {Number}
             * 
             * @memberof Loader~
             */
            MSG_TIMEOUT = 24,

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
            Module, loaderManagerNormalize, loaderManagerLogMessage;

        Module = (function moduleSetup() {
            /**
             * @access private
             *
             * @constructor Module
             * @alias Module
             * 
             * @memberof LoaderManager
             * @inner
             * 
             * @param {Loader} loader
             * @param {String} moduleName
             */
            function Module(loader, moduleName) {
                var module = this,
                    options = module.options = {},
                    implicitDependency = loaderManagerGetImplicitDependencyName(moduleName),
                    pathParts = moduleName.split('.'),
                    fileName = options.fileName = pathParts.pop(),
                    firstLetterFileName = fileName.charAt(0);

                module.name = moduleName;
                module.loader = loader;
                module.queue = [];
                module.bundleQueue = [];

                module.dep = implicitDependency;

                if (firstLetterFileName === firstLetterFileName.toLowerCase()) {
                    pathParts.push(fileName);
                }

                options.dirPath = pathParts.join(slash) + slash;

                module.state = MODULE_WAITING;
                module.bundleState = MODULE_BUNDLE_WAITING;

                module.data = {};
                module.interceptorDeps = [];
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
                    return this.isState(MODULE_REGISTERED) || this.isState(MODULE_LOADED) || this.isState(MODULE_LOADED_MANUAL);
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
                    var module = this,
                        loader = module.loader;

                    if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                        module.setBundleState(MODULE_BUNDLE_WAITING);

                        module.dep && loader.getModule(module.dep).unsetBundleLoading();
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                setBundleLoaded: function() {
                    var module = this,
                        loader = module.loader,
                        bundleName = loaderManagerGetBundleName(module.name),
                        messageType = module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED;

                    module.setBundleState(MODULE_BUNDLE_LOADED);

                    loaderManagerLogMessage(bundleName, messageType);

                    loader.notify(bundleName);
                },
                /**
                 * @access public
                 * 
                 * @return {Array}
                 */
                getAllDeps: function() {
                    var module = this,
                        implicitDependency = module.dep,
                        dependencies = (module.deps || []).concat(module.interceptorDeps);

                    implicitDependency && dependencies.unshift(implicitDependency);

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
                        fullPath = [module.getConfig('baseUrl'), module.getConfig('dirPath'), module.getConfig('fileName')];

                    if (fileType == 'js') {
                        fullPath.push(module.getConfig('versionSuffix'), module.getConfig('minified'));
                    }

                    fullPath.push('.', fileType, module.getConfig('cache') ? '' : '?_=' + new Date().getTime());

                    return fullPath.join('');
                },
                /**
                 * @access public
                 * 
                 * @param {String} option
                 * @param {String} skipUntil
                 * 
                 * @return {*}
                 */
                getConfig: function(option, skipUntil) {
                    return loaderManagerGetModuleConfig(this.name, option, skipUntil) || this.options[option];
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                depsReady: function() {
                    var module = this,
                        loader = module.loader,
                        moduleName = module.name;

                    if (module.isRegistered() && !module.isState(MODULE_LOADED)) {
                        module.init();

                        module.setState(MODULE_LOADED);
                        loaderManagerLogMessage(moduleName, MSG_MODULE_LOADED);
                        loader.notify(moduleName);
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
                 */
                bundleReady: function() {
                    var module = this,
                        loader = module.loader,
                        bundleName = loaderManagerGetBundleName(module.name),
                        messageType = module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED;

                    if (!module.isBundleState(MODULE_BUNDLE_LOADED)) {
                        module.setBundleState(MODULE_BUNDLE_LOADED);

                        loaderManagerLogMessage(bundleName, messageType);

                        loader.notify(bundleName);
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
                        loader = module.loader,
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
                        loaderManagerLogMessage(moduleName, MSG_MODULE_SUBSCRIBED, {
                            subs: moduleNames.join(separator)
                        });

                        loader.listenFor(moduleName, moduleNames, function onModuleLoaded(publishingModuleName, data) {
                            loaderManagerLogMessage(moduleName, MSG_MODULE_PUBLISHED, {
                                pub: publishingModuleName
                            });

                            if (loaderManagerGetSystem().isSet(data)) {
                                module.data[publishingModuleName] = data;
                            }

                            --module[moduleCounter] || module[moduleReady]();
                        }, function onModuleAborted() {
                            asBundle ? module.unsetBundleLoading() : loader.abort(moduleName);
                        });
                    }
                },
                /**
                 * @access public
                 * 
                 * @memberof Module#
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

                    loader.setCurrentModuleName(rootModule);
                },
                /**
                 * @access public
                 * 
                 * @return {Array}
                 */
                getDepRefs: function() {
                    var module = this,
                        loader = module.loader,
                        dependencies = module.deps || [],
                        depLen = dependencies.length,
                        depIndex = 0,
                        depRefs = [],
                        data, dependencyName;

                    for (; depIndex < depLen; depIndex++) {
                        dependencyName = dependencies[depIndex];
                        data = module.data[dependencyName];
                        depRefs.push(loaderManagerGetSystem().isSet(data) ? data : loader.getModule(dependencyName).ref);
                    }

                    return depRefs;
                }
            };

            return Module;
        })();

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * @param {Number} messageType
         * @param {Object} values
         */
        loaderManagerLogMessage = (function loaderManagerLogMessageSetup() {
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
                loaderManagerLogger;

            /**
             * 
             * @param {String} message
             * @param {String} what
             * 
             * @return {String}
             */
            function replaceWhat(message, what) {
                return message.replace('${what}', what + ' "${mod}"');
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
                return message.replace('${why}', why);
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
            MSG_CIRCULAR_DEPENDENCIES_FOUND,
            MSG_INTERCEPTION_ERROR,
            MSG_MODULE_NAME_INVALID,
            MSG_TIMEOUT], 'error');

            setLogLevelForMessageTypes([
            MSG_BUNDLE_ALREADY_LOADED,
            MSG_BUNDLE_ALREADY_LOADING,
            MSG_BUNDLE_NOT_DEFINED,
            MSG_MODULE_ALREADY_LOADED,
            MSG_MODULE_ALREADY_LOADED_MANUAL,
            MSG_MODULE_ALREADY_LOADING,
            MSG_MODULE_ALREADY_REGISTERED], 'warn');

            messageTemplates[MSG_BUNDLE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadBundle);
            messageTemplates[MSG_BUNDLE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadBundle);
            messageTemplates[MSG_BUNDLE_FOUND] = replaceBundle('found bundlemodules "${bundle}" for ${what}');
            messageTemplates[MSG_BUNDLE_LOADED] = replaceBundle(endLoad);
            messageTemplates[MSG_BUNDLE_LOADING] = replaceBundle(startLoad);
            messageTemplates[MSG_BUNDLE_NOT_DEFINED] = replaceWhy(attemptLoadBundle, 'bundle is not defined');
            messageTemplates[MSG_BUNDLE_REQUESTED] = replaceBundle(requested);

            messageTemplates[MSG_CIRCULAR_DEPENDENCIES_FOUND] = replaceModule('found circular dependencies "${deps}" for ${what}');

            messageTemplates[MSG_DEPENDENCIES_FOUND] = replaceModule('found explicit dependencies "${deps}" for ${what}');
            messageTemplates[MSG_DEPENDENCY_FOUND] = replaceModule('found implicit dependency "${dep}" for ${what}');

            messageTemplates[MSG_INTERCEPTION_ERROR] = replaceModule('error in interception of ${what}');

            messageTemplates[MSG_MODULE_ALREADY_LOADED] = replaceAlreadyLoaded(attemptLoadModule);
            messageTemplates[MSG_MODULE_ALREADY_LOADED_MANUAL] = replaceAlreadyLoaded(attemptLoadModule) + ' manual';
            messageTemplates[MSG_MODULE_ALREADY_LOADING] = replaceAlreadyLoading(attemptLoadModule);

            messageTemplates[MSG_MODULE_ALREADY_REGISTERED] = replaceWhy(replaceModule(attemptedTo + 'register ${what} but ${why}'), already + 'registered');

            messageTemplates[MSG_MODULE_LOADED] = replaceModule(endLoad);
            messageTemplates[MSG_MODULE_LOADED_MANUAL] = replaceModule('${what} was loaded manual');
            messageTemplates[MSG_MODULE_LOADING] = replaceModule(startLoad);

            messageTemplates[MSG_MODULE_NAME_INVALID] = '"${mod}" is no valid modulename';
            messageTemplates[MSG_MODULE_PUBLISHED] = '"${pub}" published to "${mod}"';
            messageTemplates[MSG_MODULE_RECOVERING] = replaceModule('${what} tries to recover...');
            messageTemplates[MSG_MODULE_REGISTERING] = replaceModule('registering ${what}...');
            messageTemplates[MSG_MODULE_REQUESTED] = replaceModule(requested);
            messageTemplates[MSG_MODULE_SUBSCRIBED] = replaceModule('${what} subscribed to "${subs}"');

            messageTemplates[MSG_TIMEOUT] = replaceModule('aborted loading ${what} after ${sec} second(s) - module may not be available on path "${path}"');

            /**
             * @access private
             * 
             * @memberof LoaderManager
             * @inner
             * 
             * @memberof LoaderManager
             * @inner
             * 
             * @param {String} moduleName
             * @param {Number} messageType
             * @param {Object} values
             */
            function loaderManagerLogMessage(moduleName, messageType, values) {
                var Logger = loaderManagerGetModuleRef('System.Logger'),
                    level = messageTypes[messageType] || 'error';

                if (Logger) {
                    values = values || {};
                    values.mod = moduleName;

                    if (!loaderManagerLogger) {
                        loaderManagerLogger = new Logger('Loader', {
                            tpl: messageTemplates
                        });
                    }

                    loaderManagerLogger[level](messageType, values);
                }
            }

            return loaderManagerLogMessage;
        })();

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @return {Loader}
         */
        function loaderManagerGetCurrentLoader() {
            return loaders[loaderConfig.context];
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * 
         * @return {String}
         */
        function loaderManagerGetImplicitDependencyName(moduleName) {
            return moduleName.substr(0, moduleName.lastIndexOf('.'));
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * 
         * @return {String}
         */
        function loaderManagerExtractBundleModuleName(moduleName) {
            return moduleName.split('.*')[0];
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * 
         * @return {String}
         */
        function loaderManagerGetBundleName(moduleName) {
            return moduleName + '.*';
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * 
         * @return {Boolean}
         */
        function loaderManagerIsBundleRequest(moduleName) {
            return rBundleRequest.test(moduleName);
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * 
         * @return {Object}
         */
        function loaderManagerGetInterceptor(moduleName) {
            var interceptor, parts, interceptorType;

            for (interceptorType in interceptors) {
                if (hasOwnProp(interceptors, interceptorType) && moduleName.indexOf(interceptorType) > -1) {
                    parts = moduleName.split(interceptorType);

                    interceptor = {
                        originalModuleName: moduleName,

                        intercept: interceptors[interceptorType],

                        moduleName: parts[0],

                        data: parts[1]
                    };

                    break;
                }
            }

            return interceptor || {
                moduleName: moduleName
            };
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * 
         * @return {*}
         */
        function loaderManagerGetModuleRef(moduleName) {
            return loaderManagerGetCurrentLoader().getModule(moduleName).ref;
        }

        function loaderManagerGetSystem() {
            return loaderManagerGetModuleRef('System');
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {(String|Array|Object)} modules
         * @param {String} referenceModule
         * @param {Boolean} isRelative
         * 
         * @return {Array<string>}
         */
        loaderManagerNormalize = (function loaderManagerNormalizeSetup() {
            /**
             *
             * @param {Array} modules
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             * 
             * @return {Array<string>}
             */
            function normalizeArray(modules, referenceModule, isRelative) {
                var normalizedModules = [],
                    moduleIndex = 0,
                    moduleCount = modules.length;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    normalizedModules = normalizedModules.concat(normalize(modules[moduleIndex], referenceModule, isRelative));
                }

                return normalizedModules;
            }

            /**
             *
             * @param {Object} modules
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             * 
             * @return {Array<string>}
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
             * @return {Array<string>}
             */
            function normalizeString(moduleName, referenceModule, isRelative) {
                var normalizedModules = [];

                if (!isRelative) {
                    while (referenceModule && rLeadingDot.test(moduleName)) {
                        moduleName = moduleName.replace(rLeadingDot, '');
                        referenceModule = loaderManagerGetImplicitDependencyName(referenceModule) || undef;
                        isRelative = !! referenceModule;
                    }
                }

                if (isRelative) {
                    moduleName = buildAbsoluteModuleName(moduleName, referenceModule);
                }

                if (!moduleName || (!isRelative && rLeadingDot.test(moduleName))) {
                    loaderManagerLogMessage(moduleName, MSG_MODULE_NAME_INVALID);
                }
                else {
                    normalizedModules = [moduleName];
                }

                return normalizedModules;
            }

            /**
             *
             * @param {String} moduleName
             * @param {String} referenceModule
             *
             * @return {String}
             */
            function buildAbsoluteModuleName(moduleName, referenceModule) {
                var dot = '.';

                if (!moduleName || moduleName === dot) {
                    moduleName = dot = '';
                }
                else if (!referenceModule.replace(/\./g, '') || !loaderManagerGetInterceptor(moduleName).moduleName) {
                    dot = '';
                }

                return referenceModule + dot + moduleName;
            }

            /**
             *
             * @param {(String|Object|Array)} modules
             * @param {String} referenceModule
             * @param {Boolean} isRelative
             *
             * @return {Array<string>}
             */
            function normalize(modules, referenceModule, isRelative) {
                var System, normalizer;

                if (modules) {
                    if (referenceModule === 'System') {
                        normalizer = modules.toString() === modules ? normalizeString : normalizeArray;
                    }
                    else {
                        System = loaderManagerGetSystem();

                        if (System.isObject(modules)) {
                            normalizer = normalizeObject;
                        }
                        else if (System.isArray(modules)) {
                            normalizer = normalizeArray;
                        }
                        else if (System.isString(modules)) {
                            normalizer = normalizeString;
                        }
                    }
                }

                return normalizer ? normalizer(modules, referenceModule, isRelative) : [];
            }

            return normalize;
        })();

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} moduleName
         * @param {String} option
         * @param {String} skipUntil
         * 
         * @return {*}
         */
        function loaderManagerGetModuleConfig(moduleName, option, skipUntil) {
            var System = loaderManagerGetSystem(),
                moduleConfigs = loaderConfig.modules,
                nextLevel = moduleName,
                skip = false,
                result;

            do {
                if (!skip && moduleConfigs[moduleName]) {
                    result = moduleConfigs[moduleName][option];
                }

                if (nextLevel) {
                    moduleName = loaderManagerGetBundleName(nextLevel);
                    nextLevel = loaderManagerGetImplicitDependencyName(nextLevel);
                }
                else {
                    moduleName = moduleName !== rootModule ? rootModule : undef;
                }

                if (skipUntil) {
                    skip = skipUntil !== moduleName;
                    skip || (skipUntil = undef);
                }

            } while (!System.isSet(result) && moduleName);

            return result;
        }

        /**
         * @access private
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} listeningModuleName
         * @param {function(string, string)} callback
         * @param {function(string)} errback
         * @param {Object} interceptor
         * 
         * @return {function(string)}
         */
        function loaderManagerCreateListener(listeningModuleName, callback, errback, interceptor) {
            return function interceptionListener(moduleName) {
                var listeningModule = loaderManagerGetCurrentLoader().getModule(listeningModuleName),
                    interceptorDeps = listeningModule.interceptorDeps,
                    interceptedModuleName = interceptor.originalModuleName,
                    System = loaderManagerGetSystem();

                interceptor.intercept({
                    listener: listeningModuleName,

                    module: loaderManagerGetModuleRef(moduleName),

                    data: interceptor.data,

                    $import: LoaderManager.$importLazy,

                    $importAndLink: function(moduleNames, callback, errback, progressback) {
                        moduleNames = loaderManagerNormalize(moduleNames);

                        interceptorDeps.push.apply(interceptorDeps, moduleNames);

                        LoaderManager.$importLazy(moduleNames, callback, errback, progressback);
                    },

                    onSuccess: function(data) {
                        callback(interceptedModuleName, data);
                    },

                    onError: function(error) {
                        if (!error) {
                            error = MSG_INTERCEPTION_ERROR;
                        }
                        else if (System.isA(error, Error)) {
                            error = error.message;
                        }

                        loaderManagerLogMessage(interceptedModuleName, System.isA(error, Error) ? error.message : error);

                        errback(interceptedModuleName);
                    }
                });
            };
        }

        /**
         * @access private
         * 
         * @class Loader
         * 
         * @memberof LoaderManager
         * @inner
         * 
         * @param {String} context
         */
        function Loader(context) {
            var loader = this;

            loader.context = context;
            loader.currentModuleName = rootModule;
            loader.modules = {};
            loader.ref = {};
            loader.modulesLoading = 0;
        }

        Loader.prototype = {
            /**
             * @access public
             *
             * @alias Loader
             * 
             * @memberof Loader#
             */
            constructor: Loader,
            /**
             * @access public
             * 
             * @memberof Loader#
             */
            init: function() {
                var loader = this;

                loader.resetModulesURLList();

                loader.registerCore();
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             */
            setCurrentModuleName: function(moduleName) {
                this.currentModuleName = moduleName;
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @return {String}
             */
            getCurrentModuleName: function() {
                return this.currentModuleName;
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             *
             * @return {Module}
             */
            getModule: function(moduleName) {
                var loader = this;

                if (loaderManagerIsBundleRequest(moduleName)) {
                    moduleName = loaderManagerExtractBundleModuleName(moduleName);
                }
                else {
                    moduleName = loaderManagerGetInterceptor(moduleName).moduleName;
                }

                return loader.modules[moduleName] || loader.createModule(moduleName);
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             *
             * @return {Module}
             */
            createModule: function(moduleName) {
                var loader = this,
                    module = loader.modules[moduleName] = new Module(loader, moduleName);

                return module;
            },
            /**
             * @access public
             * 
             * @memberof Loader#
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
             * @memberof Loader#
             * 
             * @param {Object<string, *>} properties
             * @param {function():*} factory
             */
            register: function(properties, factory) {
                var loader = this,
                    moduleName = properties.MID,
                    module = loader.getModule(moduleName);

                if (!module.isRegistered()) {
                    loaderManagerLogMessage(moduleName, MSG_MODULE_REGISTERING);

                    module.factory = factory || Object;

                    if (module.isState(MODULE_LOADING)) {
                        global.clearTimeout(module.timeoutID);
                        module.setState(MODULE_REGISTERED);
                    }
                    else {
                        loaderManagerLogMessage(moduleName, MSG_MODULE_LOADED_MANUAL);

                        module.setState(MODULE_LOADED_MANUAL);
                    }

                    if (properties.styles) {
                        SourceManager.addStyleSheet(moduleName, module.getFullPath('css'));
                    }

                    loader.linkBundle(moduleName, properties.bundle);

                    loader.linkDeps(moduleName, properties.deps);

                    loader.manageImplicitDep(moduleName, properties.autoRegLvl);

                    if (loader.checkForCircularDeps(moduleName)) {
                        loader.abort(moduleName);
                    }
                }
                else {
                    loaderManagerLogMessage(moduleName, MSG_MODULE_ALREADY_REGISTERED);
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * @param {Number} autoRegisterLevel
             */
            manageImplicitDep: function(moduleName, autoRegisterLevel) {
                var loader = this,
                    module = loader.getModule(moduleName),
                    implicitDependency = module.dep;

                if (implicitDependency) {
                    if (autoRegisterLevel > 0) {
                        loader.abort(implicitDependency, true);

                        loader.register({
                            MID: implicitDependency,
                            autoRegLvl: --autoRegisterLevel
                        });
                    }
                    else if (module.isState(MODULE_LOADED_MANUAL) || module.isState(MODULE_WAITING)) {
                        loaderManagerLogMessage(moduleName, MSG_DEPENDENCY_FOUND, {
                            dep: implicitDependency
                        });

                        module.listenFor([implicitDependency]);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * @param {Array} bundle
             */
            linkBundle: function(moduleName, bundle) {
                var loader = this,
                    module = loader.getModule(moduleName);

                bundle = loaderManagerNormalize(bundle, moduleName, true);

                module.bundle = bundle;

                if (bundle.length) {
                    loaderManagerLogMessage(loaderManagerGetBundleName(moduleName), MSG_BUNDLE_FOUND, {
                        bundle: bundle.join(separator)
                    });
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * @param {Array} dependencies
             */
            linkDeps: function(moduleName, dependencies) {
                var loader = this,
                    module = loader.getModule(moduleName);

                dependencies = loaderManagerNormalize(dependencies, moduleName);

                module.deps = dependencies;

                if (dependencies.length) {
                    loaderManagerLogMessage(moduleName, MSG_DEPENDENCIES_FOUND, {
                        deps: dependencies.join(separator)
                    });
                }

                module.listenFor(dependencies);
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {Boolean}
             */
            checkForCircularDeps: function(moduleName) {
                var loader = this,
                    hasCircularDependency = false,
                    circularDependencies;

                if (loaderConfig.checkCircularDeps) {
                    circularDependencies = loader.findCircularDeps(moduleName);
                    hasCircularDependency = !! circularDependencies.length;

                    if (hasCircularDependency) {
                        loaderManagerLogMessage(moduleName, MSG_CIRCULAR_DEPENDENCIES_FOUND, {
                            deps: circularDependencies.join(separator)
                        });
                    }
                }

                return hasCircularDependency;
            },
            // TODO is there a more performant way to check for circular dependencies?
            // for now turned of in production but can be enabled over JAR.configure('checkCircularDeps', true)
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * @param {Object} traversedModules
             * 
             * @return {Array}
             */
            findCircularDeps: function(moduleName, traversedModules) {
                var loader = this,
                    module = loader.getModule(moduleName),
                    dependencies = module.getAllDeps(),
                    depLen = dependencies.length,
                    depIndex = 0,
                    circularDependencies = [];

                moduleName = module.name;
                traversedModules = traversedModules || {};

                if (moduleName in traversedModules) {
                    circularDependencies = [moduleName];
                }
                else {
                    traversedModules[moduleName] = true;

                    for (; depIndex < depLen; depIndex++) {
                        circularDependencies = loader.findCircularDeps(loaderManagerGetInterceptor(dependencies[depIndex]).moduleName, traversedModules);

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
             * @memberof Loader#
             * 
             * @param {String} listeningModuleName
             * @param {Array<string>} moduleNames
             * @param {function(string)} callback
             * @param {function(string)} errback
             */
            listenFor: function(listeningModuleName, moduleNames, callback, errback) {
                var loader = this,
                    moduleCount = moduleNames.length,
                    moduleIndex = 0,
                    moduleName, module, isBundleRequest, queue, interceptor, onModuleLoaded;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    moduleName = moduleNames[moduleIndex];

                    isBundleRequest = loaderManagerIsBundleRequest(moduleName);

                    interceptor = loaderManagerGetInterceptor(moduleName);

                    onModuleLoaded = interceptor.intercept ? loaderManagerCreateListener(listeningModuleName, callback, errback, interceptor) : callback;
                    moduleName = interceptor.moduleName;

                    module = loader.$import(moduleName);

                    queue = module[isBundleRequest ? 'bundleQueue' : 'queue'];

                    if (!module.isState(MODULE_LOADED) || (isBundleRequest && !module.isBundleState(MODULE_BUNDLE_LOADED))) {
                        queue.push([onModuleLoaded, errback]);
                    }
                    else {
                        onModuleLoaded(moduleName);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {Module}
             */
            $import: function(moduleName) {
                return this['$import' + (loaderManagerIsBundleRequest(moduleName) ? 'Bundle' : 'Module')](moduleName);
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {Module}
             */
            $importModule: function(moduleName) {
                var loader = this,
                    module = loader.getModule(moduleName),
                    messageType;

                loaderManagerLogMessage(moduleName, MSG_MODULE_REQUESTED);

                if (module.isState(MODULE_WAITING)) {
                    loader.modulesLoading++;

                    loader.manageImplicitDep(moduleName);

                    loaderManagerLogMessage(moduleName, MSG_MODULE_LOADING);

                    module.setState(MODULE_LOADING);

                    module.timeoutID = global.setTimeout(function abortModule() {
                        loader.abort(moduleName);
                    }, module.getConfig('timeout') * 1000);

                    SourceManager.addScript(loader.context + ':' + moduleName, module.getFullPath('js'), module.getConfig('adapter'));
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

                    loaderManagerLogMessage(moduleName, messageType);
                }

                return module;
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} bundleName
             * 
             * @return {Module}
             */
            $importBundle: function(bundleName) {
                var loader = this,
                    module = loader.getModule(bundleName),
                    messageType;

                loaderManagerLogMessage(bundleName, MSG_BUNDLE_REQUESTED);

                if (module.isBundleState(MODULE_BUNDLE_LOADED)) {
                    messageType = MSG_BUNDLE_ALREADY_LOADED;
                }
                else if (module.isBundleState(MODULE_BUNDLE_LOADING)) {
                    messageType = MSG_BUNDLE_ALREADY_LOADING;
                }
                else {
                    loader.listenFor(rootModule, [module.name], function onModuleLoaded(moduleName) {
                        loader.$importBundleForModule(moduleName);
                    });

                    messageType = MSG_BUNDLE_LOADING;
                }

                loaderManagerLogMessage(bundleName, messageType);

                return module;
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             */
            $importBundleForModule: function(moduleName) {
                var loader = this,
                    module = loader.getModule(moduleName);

                if (!(module.isBundleState(MODULE_BUNDLE_LOADING) || module.isBundleState(MODULE_BUNDLE_LOADED))) {
                    loader.modulesLoading++;

                    module.setBundleState(MODULE_BUNDLE_LOADING);

                    module.listenFor(module.bundle, true);
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * @param {Boolean} silent
             */
            abort: function(moduleName, silent) {
                var loader = this,
                    module = loader.getModule(moduleName),
                    queue = module.queue.concat(module.bundleQueue),
                    path;

                if (module.isState(MODULE_LOADING)) {
                    path = SourceManager.removeScript(loader.context + ':' + moduleName);

                    if (!silent) {
                        loaderManagerLogMessage(moduleName, MSG_TIMEOUT, {
                            path: path,
                            sec: module.getConfig('timeout')
                        });

                        module.setState(MODULE_WAITING);

                        if (!loader.findRecover(moduleName)) {
                            loader.dequeue(moduleName, queue, QUEUE_ERROR);
                        }
                    }
                }
            },

            dequeue: function(moduleName, queue, queueType) {
                var callback;

                hasOwnProp(loaderCoreModules, moduleName) || this.modulesLoading--;

                while (queue.length) {
                    callback = queue.shift()[queueType];

                    if (loaderManagerGetSystem().isFunction(callback)) {
                        callback(moduleName);
                    }
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             * 
             * @return {Boolean}
             */
            findRecover: function(moduleName) {
                var loader = this,
                    module = loader.getModule(moduleName),
                    foundRecover = module.getConfig('recover', module.nextRecover),
                    recoverModuleName, recoverModuleDependency;

                if (foundRecover) {
                    recoverModuleName = foundRecover.restrict;

                    // This is a recover on a higher level
                    if (recoverModuleName !== moduleName) {
                        // extract the next recovermodule
                        recoverModuleDependency = loader.getModule(recoverModuleName).dep;
                        module.nextRecover = recoverModuleDependency ? loaderManagerGetBundleName(recoverModuleDependency) : undef;

                        // Only recover this module
                        foundRecover.restrict = moduleName;
                    }

                    LoaderManager.setModuleConfig(foundRecover);

                    // Restore module recover assoziation
                    foundRecover.restrict = recoverModuleName;

                    loaderManagerLogMessage(moduleName, MSG_MODULE_RECOVERING);

                    loader.$import(moduleName);
                }
                else {
                    delete module.nextRecover;
                }

                return !!foundRecover;
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             */
            notify: function(moduleName) {
                var loader = this,
                    queue = loader.getModule(moduleName)[loaderManagerIsBundleRequest(moduleName) ? 'bundleQueue' : 'queue'];

                loaderConfig.createDependencyURLList && loader.pushModule(moduleName);

                if (queue) {
                    loader.dequeue(moduleName, queue, QUEUE_SUCCESS);
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {Array} modules
             */
            pushModules: function(modules) {
                var moduleIndex = 0,
                    moduleCount;

                moduleCount = modules ? modules.length : 0;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    this.pushModule(modules[moduleIndex]);
                }
            },
            /**
             * @access public
             * 
             * @memberof Loader#
             * 
             * @param {String} moduleName
             */
            pushModule: function(moduleName) {
                var loader = this,
                    module = loader.getModule(moduleName),
                    sortedModules = loader.sorted,
                    isBundleRequested = loaderManagerIsBundleRequest(moduleName),
                    dependencies = module.getAllDeps();

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
            /**
             * @access public
             * 
             * @memberof Loader#
             */
            resetModulesURLList: function() {
                var loader = this,
                    moduleName;

                loader.list = [];
                loader.sorted = {};

                for (moduleName in loaderCoreModules) {
                    loader.sorted[moduleName] = true;
                }
            }
        };

        return {
            normalize: loaderManagerNormalize,
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {String} option
             * @param {*} value
             * 
             * @return {*}
             */
            setConfig: function(option, value) {
                loaderConfig[option] = value;

                return value;
            },
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {String} context
             * 
             * @return {String}
             */
            setContext: function(context) {
                loaderConfig.context = context;

                if (!hasOwnProp(loaders, context)) {
                    loaders[context] = new Loader(context);
                    loaders[context].init();
                }

                return context;
            },
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {(Object|Array)} moduleConfigs
             * 
             * @return {Object}
             */
            setModuleConfig: (function moduleConfigSetterSetup() {
                var stringCheck = 'String',
                    objectCheck = 'Object',
                    booleanCheck = 'Boolean',
                    rEndSlash = /\/$/,
                    propertyDefinitions = {
                        baseUrl: {
                            check: stringCheck,

                            transform: addEndSlashTransForm
                        },

                        cache: {
                            check: booleanCheck,
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
                            check: booleanCheck,
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
                            check: objectCheck,
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
                                    hasOwnProp(recoverConfig, option) && (recover[option] = recoverConfig[option]);
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
                                var minTimeout = 0.5;

                                timeout = Number(timeout);

                                return minTimeout > timeout ? minTimeout : timeout;
                            }
                        },

                        versionSuffix: {
                            check: stringCheck
                        }
                    };

                /**
                 * @param {String} path
                 * 
                 * @return {String}
                 */
                function addEndSlashTransForm(path) {
                    return (!path || rEndSlash.test(path)) ? path : path + slash;
                }

                /**
                 * @param {Object} moduleConfig
                 * @param {String} moduleName
                 * @param {String} property
                 * @param {*} propertyValue
                 */
                function setProperty(moduleConfig, moduleName, property, propertyValue) {
                    var System = loaderManagerGetSystem(),
                        propertyDefinition = propertyDefinitions[property],
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
                 * @access public
                 * 
                 * @memberof LoaderManager
                 * 
                 * @param {(Object|Array)} moduleConfigs
                 * 
                 * @return {Object}
                 */
                function loaderManagerSetModuleConfig(moduleConfigs) {
                    var System = loaderManagerGetSystem(),
                        oldModuleConfigs = loaderConfig.modules,
                        configIndex = 0,
                        property, moduleConfigsLen, oldModuleConfig, modules, moduleName, moduleIndex, moduleCount;

                    if (System.isArray(moduleConfigs)) {
                        moduleConfigsLen = moduleConfigs.length;

                        for (; configIndex < moduleConfigsLen; configIndex++) {
                            loaderManagerSetModuleConfig(moduleConfigs[configIndex], oldModuleConfigs);
                        }
                    }
                    else if (System.isObject(moduleConfigs)) {
                        modules = loaderManagerNormalize(moduleConfigs.restrict || rootModule);
                        moduleCount = modules.length;

                        for (moduleIndex = 0; moduleIndex < moduleCount; moduleIndex++) {
                            moduleName = modules[moduleIndex];
                            oldModuleConfig = oldModuleConfigs[moduleName] = oldModuleConfigs[moduleName] || {};

                            for (property in propertyDefinitions) {
                                hasOwnProp(propertyDefinitions, property) && setProperty(oldModuleConfig, moduleName, property, moduleConfigs[property]);
                            }
                        }
                    }

                    return oldModuleConfigs;
                }

                return loaderManagerSetModuleConfig;
            })(),
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {String} moduleName
             * @param {Object} properties
             * @param {function()} factory
             */
            addCoreModule: function(moduleName, properties, factory) {
                loaderCoreModules[moduleName] = [properties, factory];
            },
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {String} interceptorType
             * @param {function(string, *, string, function(*, array), function(string))} interceptor
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
             * @memberof LoaderManager
             * 
             * @return {String}
             */
            getCurrentModuleName: function() {
                return loaderManagerGetCurrentLoader().getCurrentModuleName();
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
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {Boolean} forceRecompute
             *
             * @return {Array}
             */
            getModulesURLList: function(loadedCallback, forceRecompute) {
                var currentLoader = loaderManagerGetCurrentLoader(),
                    loaderModules = currentLoader.modules,
                    moduleName;

                if (currentLoader.modulesLoading) {
                    global.setTimeout(function() {
                        LoaderManager.getModulesURLList(loadedCallback, forceRecompute);
                    }, 100);
                }
                else {
                    if (forceRecompute || !(loaderConfig.createDependencyURLList || currentLoader.list.length)) {
                        currentLoader.resetModulesList();

                        for (moduleName in loaderModules) {
                            hasOwnProp(loaderModules, moduleName) && currentLoader.pushModule(moduleName);
                        }
                    }

                    loadedCallback(currentLoader.list);
                }
            },

            getModuleConfig: loaderManagerGetModuleConfig,

            getModuleRef: loaderManagerGetModuleRef,

            getSystem: loaderManagerGetSystem,
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @return {Object}
             */
            getRoot: function() {
                return loaderManagerGetCurrentLoader().ref;
            },
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {(Object|Array|String)} moduleNames
             * @param {function(...*)} callback
             * @param {function(string)} errback
             * @param {function(string)} progressback
             */
            $importLazy: function(moduleNames, callback, errback, progressback) {
                var System = loaderManagerGetSystem(),
                    refs = [],
                    refsIndexLookUp = {},
                    moduleIndex = 0,
                    ref, counter, moduleCount;

                moduleNames = loaderManagerNormalize(moduleNames);
                counter = moduleCount = moduleNames.length;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    refsIndexLookUp[moduleNames[moduleIndex]] = moduleIndex;
                }

                System.isFunction(progressback) || (progressback = undef);

                loaderManagerGetCurrentLoader().listenFor(rootModule, moduleNames, function publishLazy(moduleName, data) {
                    ref = System.isSet(data) ? data : loaderManagerGetModuleRef(moduleName);
                    refs[refsIndexLookUp[moduleName]] = ref;

                    counter--;

                    progressback && progressback(ref, Number((1 - counter / moduleCount).toFixed(2)));

                    counter || callback.apply(null, refs);
                }, errback);
            },
            /**
             * @access public
             * 
             * @memberof LoaderManager
             * 
             * @param {Object} properties
             * @param {function()} factory
             */
            register: function(properties, factory) {
                var defaultContext = loaderConfig.context,
                    loaderContext, currentLoader;

                if (!SourceManager.findScript(defaultContext + ':' + properties.MID)) {
                    for (loaderContext in loaders) {
                        if (hasOwnProp(loaders, loaderContext) && SourceManager.findScript(loaderContext + ':' + properties.MID)) {
                            LoaderManager.setContext(loaderContext);
                        }
                    }
                }

                currentLoader = loaderManagerGetCurrentLoader();

                currentLoader.register(properties, factory);

                if (currentLoader !== loaders[defaultContext]) {
                    LoaderManager.setContext(defaultContext);
                }
            }
        };
    })();

    LoaderManager.addInterceptor('!', function pluginInterceptor(options) {
        var moduleRef = options.module,
            errback = options.onError;

        delete options.module;

        if (LoaderManager.getSystem().isFunction(moduleRef.plugIn)) {
            moduleRef.plugIn(options);
        }
        else {
            errback('could not call method "plugIn" on module "${mod}"');
        }
    });

    LoaderManager.addCoreModule('System', {
        bundle: ['HtmlDebugger', 'Logger']
    }, function systemSetup() {
        var types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
            nothing = null,
            typesLen = types.length,
            typeLookup = {},
            toString = object.toString,
            typeIndex = 0,
            isArgs, System;

        /**
         * @access private
         * 
         * @namespace System
         * 
         * @borrows window.isNaN as isNaN
         * @borrows window.isFinite as isFinite
         */
        System = {
            getType: getType,

            isNaN: isNaN,

            isFinite: isFinite,

            isSet: isSet
        };

        /**
         * @access public
         * 
         * @memberof System
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
            var nativeTypeTest = global[typeDef] && global[typeDef]['is' + typeDef];

            typeLookup['[object ' + typeDef + ']'] = typeDef = typeDef.toLowerCase();

            return nativeTypeTest || function typeTest(value) {
                return getType(value) === typeDef;
            };
        }

        for (; typeIndex < typesLen; typeIndex++) {
            System['is' + types[typeIndex]] = typeTestSetup(types[typeIndex]);
        }

        isArgs = System.isArguments;

        /**
         * @access public
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
         * @param {*} value
         * 
         * @return {Boolean}
         */
        System.isInteger = Number.isInteger || function(value) {
            return System.isNumber(value) && parseInt(value, 10) === value;
        };

        /**
         * @access public
         * 
         * @param {*} instance
         * @param {*} Class
         * 
         * @return {Boolean}
         */
        System.isA = function(instance, Class) {
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
        };

        /**
         * @access public
         * 
         * @param {Object} pluginRequest
         */
        System.plugIn = function(pluginRequest) {
            pluginRequest.onSuccess(function configGetter(option) {
                var config = LoaderManager.getModuleConfig(pluginRequest.listener, 'config');

                return System.isObject(config) && hasOwnProp(config, option) ? config[option] : undef;
            });
        };

        return System;
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
            baseLogger;

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
        function replacer(match, key) {
            return replacer.values[key] || 'UNKNOWN';
        }

        function noop() {}

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

        function comparePriority(level) {
            return getPriority(level) >= getPriority(config('level'));
        }

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
         * @access private
         * 
         * @memberof System
         * @inner
         * 
         * @class Logger
         * 
         * @param {String} logContext
         * @param {Object} options
         */
        function Logger(logContext, options) {
            var logger = this;

            logger.context = logContext;

            logger.options = options || {};
            logger.options.tpl = logger.options.tpl || {};
        }

        Logger.prototype._out = function(level, data, values) {
            var logger = this,
                context = logger.context,
                options = logger.options,
                currentDebugger = getActiveDebugger(options.mode || config('mode')),
                output = currentDebugger[level] || currentDebugger.log;

            if (isDebuggingEnabled(options.debug || config('debug'), level, context) && System.isFunction(output)) {
                data = options.tpl[data] || data;

                if (System.isString(data) && (System.isObject(values) || System.isArray(values))) {
                    replacer.values = values;

                    data = data.replace(rTemplateKey, replacer);

                    replacer.values = null;
                }

                output.call(currentDebugger, data, context);
            }
        };

        Logger.logLevels = {
            ALL: -Infinity
        };

        Logger.addLogLevel = function(level, priority) {
            var levelConst = level.toUpperCase();

            if (!hasOwnProp(Logger.logLevels, levelConst)) {
                Logger.logLevels[levelConst] = System.isNumber(priority) ? priority : Logger.logLevels.ALL;

                Logger.prototype[level] = function loggerFn(data, values) {
                    this._out(level, data, values);
                };

                Logger[level] = function staticLoggerFn(data, values) {
                    baseLogger[level](data, values);
                };

                Logger[level + 'WithContext'] = function staticLoggerFnWithContext(context, data, values) {
                    new Logger(context)[level](data, values);
                };
            }
        };

        /**
         * @access public
         * 
         * @memberof System
         * @inner
         *
         * @param {String} mode
         * @param {Function} debuggerSetup
         */
        Logger.addDebugger = function(mode, debuggerSetup) {
            var modeConfig = mode + 'Config';

            if (!hasOwnProp(debuggers, mode) && System.isFunction(debuggerSetup)) {
                debuggers[mode] = debuggerSetup(function(option) {
                    return (config(modeConfig) || {})[option];
                });
            }
        };

        baseLogger = new Logger('JAR');

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

            function forwardConsole(method) {
                return function log(data, logContext) {
                    if (canUseGroups && config('groupByContext')) {
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
                        logContext && (data = '[' + logContext + '] ' + data);
                    }

                    if (method === 'error' && config('throwError')) {
                        throw new Error(data);
                    }

                    return global.console[method](data);
                };
            }

            return pseudoConsole;
        });

        Logger.forCurrentModule = function(options) {
            var logContext = LoaderManager.getCurrentModuleName();

            return logContext === rootModule ? baseLogger : new Logger(logContext, options);
        };

        Logger.plugIn = function(pluginRequest) {
            var data = pluginRequest.data.split(':');

            pluginRequest.$importAndLink(data[1], function(Debugger) {
                Logger.addDebugger(data[0], Debugger.setup);

                pluginRequest.onSuccess(Logger);
            }, pluginRequest.onError);
        };

        return Logger;
    });

    LoaderManager.addCoreModule('jar', {
        bundle: ['async.*', 'feature.*', 'html.*', 'lang.*', 'util.*']
    }, function() {
        /**
         *
         * @namespace jar
         */
        var jar = {
            /**
             *
             * @param {(Object|Array|String)} moduleNames
             *
             * @return {Array}
             */
            useAll: function(moduleNames) {
                var moduleIndex = 0,
                    refs = [],
                    moduleCount;

                moduleNames = LoaderManager.normalize(moduleNames);
                moduleCount = moduleNames.length;

                for (; moduleIndex < moduleCount; moduleIndex++) {
                    refs.push(jar.use(moduleNames[moduleIndex]));
                }

                return refs;
            },
            /**
             *
             * @param {String} moduleName
             *
             * @return {*}
             */
            use: LoaderManager.getModuleRef,

            $importLazy: LoaderManager.$importLazy,

            getCurrentModuleName: LoaderManager.getCurrentModuleName
        };

        return jar;
    });

    LoaderManager.setContext('default');

    global.JAR = (function jarSetup() {
        var previousJAR = global.JAR,
            baseUrl = './',
            scripts = SourceManager.getScripts(),
            scriptCount = scripts.length - 1,
            moduleNamesQueue = [],
            configurators = {},
            configs = {
                bundle: [],
                environment: undef,
                environments: {},
                globalAccess: false,
                supressErrors: false
            },
            defaultConfig = {},
            mainScript, JAR;

        /**
         * @namespace JAR
         * @property {String} version
         * 
         * @borrows LoaderManager.register as register
         * @borrows LoaderManager.getModulesURLList as getModulesURLList
         */
        JAR = {
            /**
             * @access public
             * 
             * @memberof JAR
             * @inner
             *
             * @param {function(this:root)} main
             * @param {function(string)} onAbort
             */
            main: function(main, onAbort) {
                var System = LoaderManager.getSystem(),
                    root = LoaderManager.getRoot();

                if (moduleNamesQueue.length) {
                    LoaderManager.$importLazy(moduleNamesQueue, onImport, System.isFunction(onAbort) ? onAbort : globalErrback);
                }
                else {
                    onImport();
                }

                function onImport() {
                    var Logger = LoaderManager.getModuleRef('System.Logger');

                    if (configs.supressErrors) {
                        try {
                            Logger.log('start executing main...');
                            main.apply(root, arguments);
                        }
                        catch (e) {
                            Logger.error((e.stack || e.message || '\n\tError in JavaScript-code: ' + e) + '\nexiting...', 'error');
                        }
                        finally {
                            Logger.log('...done executing main');
                        }
                    }
                    else {
                        main.apply(root, arguments);
                    }
                }

                moduleNamesQueue.length = 0;
            },

            /**
             * @access public
             * 
             * 
             * @memberof JAR
             * @inner
             *
             * @param {(String|Object|Array)} moduleData
             */
            $import: function jarImport(moduleData) {
                moduleNamesQueue = moduleNamesQueue.concat(moduleData === rootModule ? configs.bundle : moduleData);
            },

            $export: function(moduleName, bundle, factory) {
                var System = LoaderManager.getSystem(),
                    normalizedModules = LoaderManager.normalize(moduleNamesQueue, moduleName);

                if (System.isFunction(bundle)) {
                    factory = bundle;
                    bundle = undef;
                }

                LoaderManager.register({
                    MID: moduleName,
                    deps: moduleNamesQueue,
                    bundle: bundle
                }, function() {
                    var modules = {},
                        index = 0,
                        modulesCount = normalizedModules.length;

                    for (; index < modulesCount; index++) {
                        modules[index] = modules[normalizedModules[index]] = arguments[index];
                    }

                    return factory.call(this, modules);
                });

                moduleNamesQueue.length = 0;
            },

            register: LoaderManager.register,

            /**
             * @access public
             * 
             * @memberof jar
             * @inner
             *
             * @param {(Object|String)} config
             * @param {(Object|Function)} configurator
             */
            addConfigurator: function(config, configurator) {
                var System = LoaderManager.getSystem(),
                    option;

                if (System.isString(config) && System.isFunction(configurator) && !hasOwnProp(configurators, config)) {
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
             * @memberof jar
             * @inner
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

            getModulesURLList: LoaderManager.getModulesURLList,
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
         * @param {String} abortedModuleName
         */
        function globalErrback(abortedModuleName) {
            LoaderManager.getModuleRef('System.Logger').error('Import of module "' + abortedModuleName + '" failed!');
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
             * @param {String} mainScript
             * @param {String} oldMainScript
             * 
             * @return {String}
             */
            main: function(mainScript, oldMainScript) {
                return oldMainScript || (mainScript && SourceManager.addScript('main', mainScript + '.js'));
            },
            /**
             *
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
             *
             * @param {String} environment
             * @param {String} oldEnvironment
             *
             * @return {String}
             */
            environment: function(newEnvironment, oldEnvironment, System) {
                var envCallback = configs.environments[newEnvironment];

                if (newEnvironment !== oldEnvironment && System.isFunction(envCallback)) {
                    envCallback();
                }

                return newEnvironment;
            },

            modules: function(newModuleConfigs) {
                return LoaderManager.setModuleConfig(newModuleConfigs);
            },

            context: function(newContext, oldContext) {
                if (newContext !== oldContext) {
                    newContext = LoaderManager.setContext(newContext);

                    exposeModulesGlobal(configs.globalAccess);
                }

                return newContext;
            },

            checkCircularDeps: function(checkCircularDeps) {
                return LoaderManager.setConfig('checkCircularDeps', checkCircularDeps);
            },

            createDependencyURLList: function(createDependencyURLList) {
                return LoaderManager.setConfig('createDependencyURLList', createDependencyURLList);
            },

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
            production: function() {
                JAR.configure({
                    modules: {
                        minified: true
                    },
                    
                    debugging: true,

                    globalAccess: false
                });
            },

            development: function() {
                JAR.configure({
                    modules: {
                        minified: false
                    },
                    
                    debugging: true,

                    globalAccess: true
                });
            }
        };*/

        for (; scriptCount > -1; scriptCount--) {
            mainScript = scripts[scriptCount].getAttribute('data-main');

            if (mainScript) {
                baseUrl = mainScript.substring(0, mainScript.lastIndexOf(slash)) || baseUrl;
                break;
            }
        }

        if (mainScript) {
            defaultConfig.main = mainScript;
        }

        defaultConfig.modules = {
            baseUrl: baseUrl
        };

        JAR.configure(defaultConfig);

        global.jarconfig && JAR.configure(global.jarconfig);

        return JAR;
    })();

})(this);