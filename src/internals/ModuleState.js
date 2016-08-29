JARS.internal('ModuleState', function moduleStateSetup(InternalsManager) {
    'use strict';

    var ModuleLogger = InternalsManager.get('ModuleLogger'),

        // Module states
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_WAITING = 1,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_LOADING = 2,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_LOADED = 3,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_REGISTERED = 4,
        /**
         * @access private
         *
         * @constant {Number}
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
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_BUNDLE_WAITING = 0,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_BUNDLE_LOADING = 1,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_BUNDLE_REQUESTED = 2,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        MODULE_BUNDLE_LOADED = 3,
        WAITING_STATES = [MODULE_WAITING, MODULE_BUNDLE_WAITING],
        LOADING_STATES = [MODULE_LOADING, MODULE_BUNDLE_LOADING],
        LOADED_STATES = [MODULE_LOADED, MODULE_BUNDLE_LOADED],
        LOADED_MANUAL_STATES = [MODULE_LOADED_MANUAL],
        REGISTERED_STATES = [MODULE_REGISTERED],
        REQUESTED_STATES = [null, MODULE_BUNDLE_REQUESTED],
        MODULE = 'module',
        BUNDLE = 'bundle',
        LOADING = 'loading',
        LOADED = 'loaded',
        MANUAL = ' manual',
        STARTED_LOADING = 'started ' + LOADING,
        FINISHED_LOADING = 'finished ' + LOADING,
        ATTEMPTED_TO = 'attempted to ',
        ATTEMPTED_TO_LOAD = ATTEMPTED_TO + 'load ',
        BUT_ALREADY = ' but is already ',
        ABORTED_LOADING = 'aborted ' + LOADING + ' ',
        PROBLEMS_WITH = ' because of problems with ',
        // Error when module or bundle is aborted
        MSG_MODULE_ABORTED = addAbortionMessage('given path "${path}" after ${sec} second(s) - file may not exist'),
        MSG_MODULE_DEPENDENCY_ABORTED = addAbortionMessage('dependency "${dep}"'),
        MSG_BUNDLE_ABORTED = addAbortionMessage('parent "${dep}"', true),
        MSG_BUNDLE_SUBMODULE_ABORTED = addAbortionMessage('submodule "${dep}"', true),
        // Show module or bundle is requested
        MSG_MODULE_REQUESTED = addRequestMessage(),
        MSG_BUNDLE_REQUESTED = addRequestMessage(true),
        // Show loading progress for module or bundle
        MSG_MODULE_LOADED = addLoadingMessage(),
        MSG_MODULE_LOADING = addLoadingMessage(true),
        MSG_BUNDLE_LOADED = addLoadingMessage(false, true),
        MSG_BUNDLE_LOADING = addLoadingMessage(true, true),
        // Info when loading is already in progress or done
        MSG_MODULE_ALREADY_LOADED = addLoadAttemptMessage(LOADED),
        MSG_MODULE_ALREADY_LOADED_MANUAL = addLoadAttemptMessage(LOADED + MANUAL),
        MSG_MODULE_ALREADY_LOADING = addLoadAttemptMessage(LOADING),
        MSG_BUNDLE_ALREADY_LOADED = addLoadAttemptMessage(LOADED, true),
        MSG_BUNDLE_ALREADY_LOADING = addLoadAttemptMessage(LOADING, true),
        // Warning when a module is registered twice
        MSG_MODULE_ALREADY_REGISTERED = ModuleLogger.addWarning(ATTEMPTED_TO + 'register ' + MODULE + BUT_ALREADY + ' registered'),
        // Show special cases for module
        MSG_MODULE_LOADED_MANUAL = ModuleLogger.addDebug(MODULE + ' was ' + LOADED, MANUAL),
        MSG_MODULE_RECOVERING = ModuleLogger.addDebug(MODULE + ' failed to load and tries to recover...'),
        MSG_MODULE_REGISTERING = ModuleLogger.addDebug(MODULE + ' registering...');

    /**
    * @access public
    *
    * @constructor ModuleState
    *
    * @memberof JARS
    * @inner
    *
    * @param {JARS~Module} module
    */
    function ModuleState(module) {
        var moduleState = this;

        moduleState._module = module;

        moduleState.setWaiting();
        moduleState.setWaiting(true);
    }

    ModuleState.prototype = {
        /**
         * @access public
         *
         * @alias JARS~ModuleState
         *
         * @memberof JARS~ModuleState#
         */
         constructor: ModuleState,
        /**
         * @access private
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Number[]} states
         * @param {Boolean} compareBundleState
         */
        _compareState: function(states, compareBundleState) {
            return this[getStateProp(compareBundleState)] === states[compareBundleState ? 1 : 0];
        },
        /**
         * @access private
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Number[]} states
         * @param {Boolean} setBundleState
         */
        _set: function(states, setBundleState) {
            this[getStateProp(setBundleState)] = states[setBundleState ? 1 : 0];
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} isBundleState
         */
        isWaiting: function(isBundleState) {
            return this._compareState(WAITING_STATES, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isBundleRequested: function() {
            return this._compareState(REQUESTED_STATES, true);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} isBundleState
         */
        isLoading: function(isBundleState) {
            return this._compareState(LOADING_STATES, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isRegistered: function() {
            return this._compareState(REGISTERED_STATES) || this.isLoadedManual() || this.isLoaded();
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isLoadedManual: function() {
            return this._compareState(LOADED_MANUAL_STATES);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} setBundleState
         */
        isLoaded: function(isBundleState) {
            return this._compareState(LOADED_STATES, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} setBundleState
         */
        setWaiting: function(setBundleState) {
            this._set(WAITING_STATES, setBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} setBundleState
         */
        setLoading: function(setBundleState) {
            var moduleState = this,
                module = moduleState._module;

            moduleState._set(LOADING_STATES, setBundleState);
            module.logger.log(setBundleState ? MSG_BUNDLE_LOADING : MSG_MODULE_LOADING, {
                path: module.getFullPath()
            });
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        setRegistered: function() {
            this._set(REGISTERED_STATES);
            this._module.logger.log(MSG_MODULE_REGISTERING);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        setLoadedManual: function() {
            this._set(LOADED_MANUAL_STATES);
            this._module.logger.log(MSG_MODULE_LOADED_MANUAL);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} setBundleState
         */
        setLoaded: function(setBundleState) {
            var moduleState = this,
                module = moduleState._module;

            moduleState._set(LOADED_STATES, setBundleState);
            module.logger.log(setBundleState ? MSG_BUNDLE_LOADED : MSG_MODULE_LOADED);
        },

        trySetRequested: function(setBundleState) {
            var moduleState = this,
                logger = moduleState._module.logger,
                isWaiting = moduleState.isWaiting(setBundleState);

            logger.log(setBundleState ? MSG_BUNDLE_REQUESTED : MSG_MODULE_REQUESTED);

            if(!isWaiting) {
                logger.log(getRequestStateMessage(moduleState, setBundleState));
            }
            else {
                setBundleState ? moduleState._set(REQUESTED_STATES, setBundleState) : moduleState.setLoading();
            }

            return isWaiting;
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @return {Boolean}
         */
        trySetRegistered: function() {
            var moduleState = this,
                registered = false;

            if (!moduleState.isRegistered()) {
                if (moduleState.isLoading()) {
                    moduleState.setRegistered();
                }
                else {
                    moduleState.setLoadedManual();
                }

                registered = true;
            }
            else {
                moduleState._module.logger.log(MSG_MODULE_ALREADY_REGISTERED);
            }

            return registered;
        },

        trySetAborted: function(setBundleState, abortionInfo) {
            var moduleState = this,
                module = moduleState._module,
                aborted = false,
                abortionMessage;

            if (moduleState.isLoading(setBundleState)) {
                moduleState.setWaiting(setBundleState);

                if (setBundleState || !module.findRecover()) {
                    aborted = true;
                    abortionMessage = setBundleState ? MSG_BUNDLE_SUBMODULE_ABORTED : MSG_MODULE_ABORTED;
                }
            }
            else if (moduleState.isRegistered()) {
                aborted = true;
                abortionMessage = setBundleState ? MSG_BUNDLE_ABORTED : MSG_MODULE_DEPENDENCY_ABORTED;
            }

            aborted && module.logger.log(abortionMessage, abortionInfo);

            return aborted;
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        logRecovering: function() {
            this._module.logger.log(MSG_MODULE_RECOVERING);
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~ModuleState
     * @inner
     *
     * @param {Boolean} isBundleState
     *
     * @return {String}
     */
    function getStateProp(isBundleState) {
        return isBundleState ? '_bundleState' : '_state';
    }

    function getRequestStateMessage(moduleState, setBundleState) {
        var requestStateMsg;

        if(moduleState.isLoaded(setBundleState)) {
            requestStateMsg = setBundleState ? MSG_BUNDLE_ALREADY_LOADED : MSG_MODULE_ALREADY_LOADED;
        }
        else if (moduleState.isLoadedManual()) {
            requestStateMsg = MSG_MODULE_ALREADY_LOADED_MANUAL;
        }
        else {
            requestStateMsg = setBundleState ? MSG_BUNDLE_ALREADY_LOADING : MSG_MODULE_ALREADY_LOADING;
        }

        return requestStateMsg;
    }

    function getModuleOrBundleString(forBundle) {
        return forBundle ? BUNDLE : MODULE;
    }

    function addRequestMessage(forBundle) {
        return ModuleLogger.addDebug(getModuleOrBundleString(forBundle) + ' requested', forBundle);
    }

    function addLoadingMessage(start, forBundle) {
        return ModuleLogger.addInfo((start ? STARTED_LOADING : FINISHED_LOADING) + getModuleOrBundleString(forBundle), forBundle);
    }

    function addLoadAttemptMessage(loadingProgress, forBundle) {
        return ModuleLogger.addInfo(ATTEMPTED_TO_LOAD + getModuleOrBundleString(forBundle) + BUT_ALREADY + loadingProgress, forBundle);
    }

    function addAbortionMessage(abortionReason, forBundle) {
        return ModuleLogger.addError(ABORTED_LOADING + getModuleOrBundleString(forBundle) + PROBLEMS_WITH + abortionReason, forBundle);
    }

    return ModuleState;
});
