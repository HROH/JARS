JARS.internal('ModuleState', function moduleStateSetup(InternalsManager) {
    'use strict';

    var ModuleLogger = InternalsManager.get('ModuleLogger'),
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        WAITING_STATE = 1,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        LOADING_STATE = 2,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        LOADED_STATE = 3,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        LOADED_MANUAL_STATE = 4,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        REGISTERED_STATE = 5,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        REQUESTED_STATE = 6,
        MODULE = 'module',
        BUNDLE = 'bundle',
        LOADING = 'loading',
        LOADED = 'loaded',
        LOADED_MANUAL = LOADED + ' manual',
        STARTED_LOADING = 'started ' + LOADING + ' ',
        FINISHED_LOADING = 'finished ' + LOADING + ' ',
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
        MSG_MODULE_ALREADY_LOADED_MANUAL = addLoadAttemptMessage(LOADED_MANUAL),
        MSG_MODULE_ALREADY_LOADING = addLoadAttemptMessage(LOADING),
        MSG_BUNDLE_ALREADY_LOADED = addLoadAttemptMessage(LOADED, true),
        MSG_BUNDLE_ALREADY_LOADING = addLoadAttemptMessage(LOADING, true),
        // Warning when a module is registered twice
        MSG_MODULE_ALREADY_REGISTERED = ModuleLogger.addWarning(ATTEMPTED_TO + 'register ' + MODULE + BUT_ALREADY + ' registered'),
        // Show special cases for module
        MSG_MODULE_LOADED_MANUAL = ModuleLogger.addDebug(MODULE + ' was ' + LOADED_MANUAL),
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
         * @param {Number[]} state
         * @param {Boolean} compareBundleState
         */
        _compareState: function(state, compareBundleState) {
            return this[getStateProp(compareBundleState)] === state;
        },
        /**
         * @access private
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Number} state
         * @param {Boolean} setBundleState
         */
        _set: function(state, setBundleState) {
            this[getStateProp(setBundleState)] = state;
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} isBundleState
         */
        isWaiting: function(isBundleState) {
            return this._compareState(WAITING_STATE, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isBundleRequested: function() {
            return this._compareState(REQUESTED_STATE, true);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} isBundleState
         */
        isLoading: function(isBundleState) {
            return this._compareState(LOADING_STATE, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isRegistered: function() {
            return this._compareState(REGISTERED_STATE) || this.isLoadedManual() || this.isLoaded();
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isLoadedManual: function() {
            return this._compareState(LOADED_MANUAL_STATE);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} setBundleState
         */
        isLoaded: function(isBundleState) {
            return this._compareState(LOADED_STATE, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Boolean} setBundleState
         */
        setWaiting: function(setBundleState) {
            this._set(WAITING_STATE, setBundleState);
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

            moduleState._set(LOADING_STATE, setBundleState);
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
            this._set(REGISTERED_STATE);
            this._module.logger.log(MSG_MODULE_REGISTERING);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        setLoadedManual: function() {
            this._set(LOADED_MANUAL_STATE);
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

            moduleState._set(LOADED_STATE, setBundleState);
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
                setBundleState ? moduleState._set(REQUESTED_STATE, setBundleState) : moduleState.setLoading();
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
