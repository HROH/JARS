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

    stateMsgMap[LOADING_STATE] = MSG_LOADING;
    stateMsgMap[LOADED_STATE] = MSG_LOADED;
    stateMsgMap[LOADED_MANUALLY_STATE] = MSG_LOADED_MANUALLY;
    stateMsgMap[REGISTERED_STATE] = MSG_REGISTERING;

    /**
    * @access public
    *
    * @constructor ModuleState
    *
    * @memberof JARS
    * @inner
    *
    * @param {JARS~ModuleLogger} logger
    */
    function ModuleState(logger) {
        var moduleState = this;

        moduleState._logger = logger;
        moduleState._state = WAITING_STATE;
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
         * @param {Number} newState
         * @param {Object} [info]
         */
        _setAndLog: function(newState, info) {
            this._state = newState;
            this._logger.info(stateMsgMap[newState], info);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @return {Boolean}
         */
        isLoading: function() {
            return this._state === LOADING_STATE;
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @return {Boolean}
         */
        isRegistered: function() {
            var moduleState = this,
                state = moduleState._state;

            return state === REGISTERED_STATE || state === LOADED_MANUALLY_STATE || moduleState.isLoaded();
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @return {Boolean}
         */
        isLoaded: function() {
            return this._state === LOADED_STATE;
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         */
        setLoaded: function() {
            var moduleState = this;

            moduleState._setAndLog(LOADED_STATE);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {Object} requestInfo
         *
         * @return {Boolean}
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
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @return {Boolean}
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
         * @access public
         *
         * @memberof JARS~ModuleState#
         *
         * @param {String} abortionMessage
         * @param {Object} abortionInfo
         */
        setAborted: function(abortionMessage, abortionInfo) {
            var moduleState = this;

            moduleState._state = WAITING_STATE;

            moduleState._logger.error(ABORTED_LOADING + abortionMessage, abortionInfo);
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~ModuleState
     *
     * @param {JARS~ModuleState} moduleState
     *
     * @return {String}
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
