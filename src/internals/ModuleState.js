JARS.internal('ModuleState', function moduleStateSetup() {
    'use strict';

    var stateMsgMap = {},
        LOADING = 'loading',
        LOADED = 'loaded',
        LOADED_MANUALLY = LOADED + ' manually',
        ATTEMPTED_TO = 'attempted to ',
        ATTEMPTED_TO_LOAD = ATTEMPTED_TO + 'load',
        BUT_ALREADY = ' but is already ',
        ABORTED_LOADING = 'aborted ' + LOADING + ' because of problems with ',
        // Show module or bundle is requested
        MSG_REQUESTED = 'was requested',
        // Show loading progress for module or bundle
        MSG_LOADED = 'finished ' + LOADING,
        MSG_LOADING = 'started ' + LOADING,
        // Info when loading is already in progress or done
        MSG_ALREADY_LOADED = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADED,
        MSG_ALREADY_LOADED_MANUAL = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADED_MANUALLY,
        MSG_ALREADY_LOADING = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADING,
        // Warning when a module is registered twice
        MSG_ALREADY_REGISTERED = ATTEMPTED_TO + 'register' + BUT_ALREADY + 'registered',
        // Show special cases for module
        MSG_LOADED_MANUALLY = 'was ' + LOADED_MANUALLY,
        MSG_REGISTERING = 'is registering...',
        // Module/bundle states
        /**
         * @private
         *
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.ModuleState
         */
        WAITING_STATE = 1,
        /**
         * @private
         *
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.ModuleState
         */
        LOADING_STATE = 2,
        /**
         * @private
         *
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.ModuleState
         */
        LOADED_STATE = 3,
        /**
         * @private
         *
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.ModuleState
         */
        LOADED_MANUALLY_STATE = 4,
        /**
         * @private
         *
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.ModuleState
         */
        REGISTERED_STATE = 5;

    stateMsgMap[LOADING_STATE] = MSG_LOADING;
    stateMsgMap[LOADED_STATE] = MSG_LOADED;
    stateMsgMap[LOADED_MANUALLY_STATE] = MSG_LOADED_MANUALLY;
    stateMsgMap[REGISTERED_STATE] = MSG_REGISTERING;

    /**
    * @class
    *
    * @memberof JARS.internals
    *
    * @param {JARS.internals.ModuleLogger} logger
    */
    function ModuleState(logger) {
        var moduleState = this;

        moduleState._logger = logger;
        moduleState._state = WAITING_STATE;
    }

    ModuleState.prototype = {
        constructor: ModuleState,
        /**
         * @private
         *
         * @param {number} newState
         * @param {Object} [info]
         */
        _setAndLog: function(newState, info) {
            this._state = newState;
            this._logger.info(stateMsgMap[newState], info);
        },
        /**
         * @return {boolean}
         */
        isLoading: function() {
            return this._state === LOADING_STATE;
        },
        /**
         * @return {boolean}
         */
        isRegistered: function() {
            var moduleState = this,
                state = moduleState._state;

            return state === REGISTERED_STATE || state === LOADED_MANUALLY_STATE || moduleState.isLoaded();
        },
        /**
         * @return {boolean}
         */
        isLoaded: function() {
            return this._state === LOADED_STATE;
        },

        setLoaded: function() {
            var moduleState = this;

            moduleState._setAndLog(LOADED_STATE);
        },
        /**
         * @param {Object} requestInfo
         *
         * @return {boolean}
         */
        trySetRequested: function(requestInfo) {
            var moduleState = this,
                logger = moduleState._logger,
                isWaiting = moduleState._state === WAITING_STATE;

            logger.info(MSG_REQUESTED);

            if(!isWaiting) {
                logger.info(getRequestStateMessage(moduleState));
            }
            else {
                moduleState._setAndLog(LOADING_STATE, requestInfo);
            }

            return isWaiting;
        },
        /**
         * @return {boolean}
         */
        trySetRegistered: function() {
            var moduleState = this,
                canRegister = !moduleState.isRegistered();

            if (canRegister) {
                moduleState._setAndLog(moduleState.isLoading() ? REGISTERED_STATE : LOADED_MANUALLY_STATE);
            }
            else {
                moduleState._logger.warn(MSG_ALREADY_REGISTERED);
            }

            return canRegister;
        },
        /**
         * @param {string} abortionMessage
         * @param {Object} abortionInfo
         */
        setAborted: function(abortionMessage, abortionInfo) {
            var moduleState = this;

            moduleState._state = WAITING_STATE;

            moduleState._logger.error(ABORTED_LOADING + abortionMessage, abortionInfo);
        }
    };

    /**
     * @private
     *
     * @memberof JARS.internals.ModuleState
     *
     * @param {JARS.internals.ModuleState} moduleState
     *
     * @return {string}
     */
    function getRequestStateMessage(moduleState) {
        var requestStateMsg;

        if(moduleState.isLoaded()) {
            requestStateMsg = MSG_ALREADY_LOADED;
        }
        else if (moduleState._state === LOADED_MANUALLY_STATE) {
            requestStateMsg = MSG_ALREADY_LOADED_MANUAL;
        }
        else {
            requestStateMsg = MSG_ALREADY_LOADING;
        }

        return requestStateMsg;
    }

    return ModuleState;
});
