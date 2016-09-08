JARS.internal('ModuleState', function moduleStateSetup() {
    'use strict';

    var LOADING = 'loading',
        LOADED = 'loaded',
        LOADED_MANUALLY = LOADED + ' manually',
        ATTEMPTED_TO = 'attempted to ',
        ATTEMPTED_TO_LOAD = ATTEMPTED_TO + 'load',
        BUT_ALREADY = ' but is already ',
        ABORTED_LOADING = 'aborted ' + LOADING + ' because of problems with ',
        // Error when module or bundle is aborted
        MSG_MODULE_ABORTED = createAbortionMessage('given path "${path}" after ${sec} second(s) - file may not exist'),
        MSG_MODULE_DEPENDENCY_ABORTED = createAbortionMessage('dependency "${dep}"'),
        MSG_BUNDLE_ABORTED = createAbortionMessage('parent "${dep}"'),
        MSG_BUNDLE_SUBMODULE_ABORTED = createAbortionMessage('submodule "${dep}"'),
        // Show module or bundle is requested
        MSG_REQUESTED = 'was requested',
        // Show loading progress for module or bundle
        MSG_LOADED = createLoadingMessage('finished'),
        MSG_LOADING = createLoadingMessage('started'),
        // Info when loading is already in progress or done
        MSG_ALREADY_LOADED = createLoadAttemptMessage(LOADED),
        MSG_ALREADY_LOADED_MANUAL = createLoadAttemptMessage(LOADED_MANUALLY),
        MSG_ALREADY_LOADING = createLoadAttemptMessage(LOADING),
        // Warning when a module is registered twice
        MSG_ALREADY_REGISTERED = ATTEMPTED_TO + 'register' + BUT_ALREADY + 'registered',
        // Show special cases for module
        MSG_LOADED_MANUALLY = 'was ' + LOADED_MANUALLY,
        MSG_REGISTERING = 'is registering...',
        // Module/bundle states
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
        LOADED_MANUALLY_STATE = 4,
        /**
         * @access private
         *
         * @constant {Number}
         * @default
         *
         * @memberof JARS~ModuleState
         * @inner
         */
        REGISTERED_STATE = 5;

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

        moduleState._set(WAITING_STATE);
        moduleState._set(WAITING_STATE, true);
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
        isLoading: function(isBundleState) {
            return this._compareState(LOADING_STATE, isBundleState);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        isRegistered: function() {
            var moduleState = this;

            return moduleState._compareState(REGISTERED_STATE) || moduleState._compareState(LOADED_MANUALLY_STATE) || moduleState.isLoaded();
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
        setLoaded: function(setBundleState) {
            var moduleState = this,
                module = moduleState._module;

            moduleState._set(LOADED_STATE, setBundleState);
            module.logger.info(MSG_LOADED, setBundleState);
        },

        trySetRequested: function(setBundleState) {
            var moduleState = this,
                module = moduleState._module,
                logger = module.logger,
                isWaiting = moduleState._compareState(WAITING_STATE, setBundleState);

            logger.debug(MSG_REQUESTED, setBundleState);

            if(!isWaiting) {
                logger.info(getRequestStateMessage(moduleState, setBundleState));
            }
            else {
                moduleState._set(LOADING_STATE, setBundleState);
                logger.info(MSG_LOADING, setBundleState, {
                    path: module.getFullPath()
                });
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
                logger = moduleState._module.logger,
                registered = false,
                isLoading = moduleState.isLoading();

            if (!moduleState.isRegistered()) {
                moduleState._set(isLoading ? REGISTERED_STATE : LOADED_MANUALLY_STATE);
                logger.debug(isLoading ? MSG_REGISTERING : MSG_LOADED_MANUALLY);

                registered = true;
            }
            else {
                logger.warn(MSG_ALREADY_REGISTERED);
            }

            return registered;
        },

        trySetAborted: function(setBundleState, abortionInfo) {
            var moduleState = this,
                module = moduleState._module,
                aborted = false,
                abortionMessage;

            if (moduleState.isLoading(setBundleState) && (setBundleState || !module.findRecover())) {
                moduleState._set(WAITING_STATE, setBundleState);
                aborted = true;
                abortionMessage = setBundleState ? (moduleState.isRegistered() ? MSG_BUNDLE_SUBMODULE_ABORTED : MSG_BUNDLE_ABORTED) : MSG_MODULE_ABORTED;
            }
            else if (moduleState.isRegistered()) {
                aborted = true;
                abortionMessage = setBundleState ? MSG_BUNDLE_SUBMODULE_ABORTED : MSG_MODULE_DEPENDENCY_ABORTED;
            }

            aborted && module.logger.error(abortionMessage, setBundleState, abortionInfo);

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
            requestStateMsg = MSG_ALREADY_LOADED;
        }
        else if (moduleState._compareState(LOADED_MANUALLY_STATE)) {
            requestStateMsg = MSG_ALREADY_LOADED_MANUAL;
        }
        else {
            requestStateMsg = MSG_ALREADY_LOADING;
        }

        return requestStateMsg;
    }

    function createLoadingMessage(loadingProgress) {
        return loadingProgress + ' ' + LOADING;
    }

    function createLoadAttemptMessage(loadingProgress) {
        return ATTEMPTED_TO_LOAD + BUT_ALREADY + loadingProgress;
    }

    function createAbortionMessage(abortionReason) {
        return ABORTED_LOADING + abortionReason;
    }

    return ModuleState;
});
