JARS.internal('ModuleState', function(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        concatString = utils.concatString,
        SEPERATOR = '", "',

        // Module message indices
        /**
         * @access private
         *
         * @constant
         * @type {Number}
         * @default
         *
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
         * @inner
         */
        MSG_MODULE_TIMEOUT = 26,

        MSG_DEPENDENCY_ABORTED = 27,

        // Module states
        /**
         * @access private
         *
         * @constant
         * @type {Number}
         * @default
         *
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
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
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_BUNDLE_LOADED = 3,
        messageTemplates = [],
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
        ABORTED_LOADING = concatString('aborted', LOADING);

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
        MSG_MODULE_SUBSCRIBED
    ], 'debug');

    setLogLevelForMessageTypes([
        MSG_BUNDLE_ALREADY_LOADED,
        MSG_BUNDLE_ALREADY_LOADING,
        MSG_MODULE_ALREADY_LOADED,
        MSG_MODULE_ALREADY_LOADING
    ], 'info');

    setLogLevelForMessageTypes([
        MSG_BUNDLE_NOT_DEFINED,
        MSG_MODULE_ALREADY_LOADED_MANUAL,
        MSG_MODULE_ALREADY_REGISTERED,
        MSG_MODULE_RECOVERING
    ], 'warn');

    setLogLevelForMessageTypes([
        MSG_BUNDLE_ABORTED,
        MSG_CIRCULAR_DEPENDENCIES_FOUND,
        MSG_INTERCEPTION_ERROR,
        MSG_MODULE_TIMEOUT,
        MSG_DEPENDENCY_ABORTED
    ], 'error');

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
    messageTemplates[MSG_DEPENDENCY_ABORTED] = concatString(ABORTED_LOADING, MODULE, 'because of problems with "${dep}"');

    function ModuleState(module) {
        var moduleState = this;

        moduleState.module = module;

        moduleState.state = MODULE_WAITING;
        moduleState.bundleState = MODULE_BUNDLE_WAITING;
    }

    ModuleState.prototype = {
        get: function(bundleState) {
            return this[bundleState ? 'bundleState' : 'state'];
        },

        set: function(bundleState, newState) {
            this[bundleState ? 'bundleState' : 'state'] = newState;
        },

        isWaiting: function(bundleState) {
            var compareState = bundleState ? MODULE_BUNDLE_WAITING : MODULE_WAITING;

            return this.get(bundleState) === compareState;
        },

        isBundleRequested: function() {
            return this.get(true) === MODULE_BUNDLE_REQUESTED;
        },

        isLoading: function(bundleState) {
            var compareState = bundleState ? MODULE_BUNDLE_LOADING : MODULE_LOADING;

            return this.get(bundleState) === compareState;
        },

        isRegistered: function() {
            var state = this.get();

            return state === MODULE_REGISTERED || state === MODULE_LOADED_MANUAL || state === MODULE_LOADED;
        },

        isLoadedManual: function() {
            return this.get() === MODULE_LOADED_MANUAL;
        },

        isLoaded: function(bundleState) {
            var compareState = bundleState ? MODULE_BUNDLE_LOADED : MODULE_LOADED;

            return this.get(bundleState) === compareState;
        },

        setWaiting: function() {

        },

        setBundleRequested: function() {
            this.set(true, MODULE_BUNDLE_REQUESTED);
        },

        setLoading: function(bundleState) {
            var state = this;

            state.set(bundleState, bundleState ? MODULE_BUNDLE_LOADING : MODULE_LOADING);
            state.log(bundleState ? MSG_BUNDLE_LOADING : MSG_MODULE_LOADING, bundleState, {
                path: state.module.getFullPath()
            });
        },

        setRegistered: function() {
            this.set(false, MODULE_REGISTERED);
            this.log(MSG_MODULE_REGISTERING);
        },

        setLoadedManual: function() {
            this.set(false, MODULE_LOADED_MANUAL);
            this.log(MSG_MODULE_LOADED_MANUAL);
        },

        setLoaded: function(bundleState) {
            var moduleState = this;

            moduleState.set(bundleState, bundleState ? MODULE_BUNDLE_LOADED : MODULE_LOADED);

            moduleState.log(bundleState ? (moduleState.module.bundle.length ? MSG_BUNDLE_LOADED : MSG_BUNDLE_NOT_DEFINED) : MSG_MODULE_LOADED);
        },
        /**
         * @access public
         *
         * @function
         * @memberof JARS~ModuleState#
         *
         * @param {Number} messageType
         * @param {Boolean} logBundle
         * @param {Object} values
         */
        log: function(messageType, logBundle, values) {
            var module = this.module,
                moduleName = module.getName(logBundle),
                context = (logBundle ? 'Bundle' : 'Module') + ':' + moduleName,
                Logger = module.loader.getLogger(),
                level = messageTypes[messageType] || 'error';

            if (Logger) {
                Logger[level + 'WithContext'](context, messageType, values, {
                    tpl: messageTemplates
                });
            }
        },

        logRequested: function(logBundle) {
            this.log(logBundle ? MSG_BUNDLE_REQUESTED : MSG_MODULE_REQUESTED, logBundle);
        },

        logRequestProgress: function(logBundle) {
            var state = this,
                requestStateMsg;

            if(state.isLoaded(logBundle)) {
                requestStateMsg = logBundle ? MSG_BUNDLE_ALREADY_LOADED : MSG_MODULE_ALREADY_LOADED;
            }
            else if (state.isLoadedManual()) {
                requestStateMsg = MSG_MODULE_ALREADY_LOADED_MANUAL;
            }
            else {
                requestStateMsg = logBundle ? MSG_BUNDLE_ALREADY_LOADING : MSG_MODULE_ALREADY_LOADING;
            }

            state.log(requestStateMsg, logBundle);
        },

        logBundleFound: function(bundle) {
            this.log(MSG_BUNDLE_FOUND, true, {
                bundle: bundle.join(SEPERATOR)
            });
        },

        logCircularDepsFound: function(deps) {
            this.log(MSG_CIRCULAR_DEPENDENCIES_FOUND, false, {
                deps: deps.join(SEPERATOR)
            });
        },

        logDepsFound: function(deps) {
            this.log(MSG_DEPENDENCIES_FOUND, false, {
                deps: deps.join(SEPERATOR)
            });
        },

        logDepFound: function(dep) {
            this.log(MSG_DEPENDENCY_FOUND, false, {
                dep: dep
            });
        },

        logRecovering: function() {
            this.log(MSG_MODULE_RECOVERING);
        },

        logAbortion: function(bundleState, data) {
            this.log(bundleState ? MSG_BUNDLE_ABORTED : MSG_MODULE_TIMEOUT, bundleState, data);
        },

        logAbortionOfDep: function(dep) {
            this.log(MSG_DEPENDENCY_ABORTED, false, {
                dep: dep
            });
        },

        logSubscription: function(subs, logBundle) {
            this.log(logBundle ? MSG_BUNDLE_SUBSCRIBED : MSG_MODULE_SUBSCRIBED, logBundle, {
                subs: subs.join(SEPERATOR)
            });
        },

        logNotification: function(pub, logBundle) {
            this.log(logBundle ? MSG_BUNDLE_NOTIFIED : MSG_MODULE_NOTIFIED, logBundle, {
                pub: pub
            });
        },

        logAlreadyRegistered: function() {
            this.log(MSG_MODULE_ALREADY_REGISTERED);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Object} interceptorInfo
         * @param {(String|Error)} error
         */
        logInterceptorError: function(interceptorInfo, error) {
            var state = this,
                System = state.module.loader.getSystem();

            if (!error) {
                error = MSG_INTERCEPTION_ERROR;
            }
            else if (System.isA(error, Error)) {
                error = error.message;
            }

            state.log(error, false, interceptorInfo);
        },
    };

    /**
     * @access private
     *
     * @param {Array<number>} messages
     * @param {String} logLevel
     */
    function setLogLevelForMessageTypes(messages, logLevel) {
        utils.arrayEach(messages, function setLogLevelForMessageType(message) {
            messageTypes[message] = logLevel;
        });
    }

    return ModuleState;
});
