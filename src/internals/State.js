JARS.internal('State', function stateSetup(InternalsManager) {
    'use strict';

    var StateQueue = InternalsManager.get('StateQueue'),
        stateMsgMap = {},
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
        // Info when loading is already in progress, done or aborted
        MSG_ALREADY_LOADED = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADED,
        MSG_ALREADY_LOADED_MANUALLY = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADED_MANUALLY,
        MSG_ALREADY_LOADING = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADING,
        MSG_ALEADY_ABORTED = ATTEMPTED_TO_LOAD + BUT_ALREADY + 'aborted',
        // Warning when a module is registered twice
        MSG_ALREADY_REGISTERED = ATTEMPTED_TO + 'register' + BUT_ALREADY + 'registered',
        // Show special cases for module
        MSG_LOADED_MANUALLY = 'was ' + LOADED_MANUALLY,
        MSG_REGISTERING = 'is registering...',
        PROGRESS_MESSAGE = 0,
        ALREADY_PROGRESSED_MESSAGE = 1,
        // Module/bundle states
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        WAITING_STATE = 1,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        LOADING_STATE = 2,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        LOADED_STATE = 3,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        LOADED_MANUALLY_STATE = 4,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        REGISTERED_STATE = 5,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        ABORTED_STATE = 6;

    stateMsgMap[LOADING_STATE] = [MSG_LOADING, MSG_ALREADY_LOADING];
    stateMsgMap[LOADED_STATE] = [MSG_LOADED, MSG_ALREADY_LOADED];
    stateMsgMap[LOADED_MANUALLY_STATE] = [MSG_LOADED_MANUALLY, MSG_ALREADY_LOADED_MANUALLY];
    stateMsgMap[REGISTERED_STATE] = [MSG_REGISTERING, MSG_ALREADY_REGISTERED];
    stateMsgMap[ABORTED_STATE] = [null, MSG_ALEADY_ABORTED];

    /**
    * @class
    *
    * @memberof JARS.internals
    *
    * @param {JARS.internals.ModuleLogger} logger
    */
    function State(moduleOrBundleName, logger) {
        var state = this;

        state._moduleOrBundleName = moduleOrBundleName;
        state._logger = logger;
        state._state = WAITING_STATE;
        state._queue = new StateQueue(moduleOrBundleName, state);
    }

    State.prototype = {
        constructor: State,
        /**
         * @private
         *
         * @param {number} newState
         * @param {Object} [info]
         */
        _setAndLog: function(newState, info) {
            this._state = newState;
            this._logger.info(stateMsgMap[newState][PROGRESS_MESSAGE], info);
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
            var state = this,
                currentState = state._state;

            return currentState === REGISTERED_STATE || currentState === LOADED_MANUALLY_STATE || state.isLoaded();
        },
        /**
         * @return {boolean}
         */
        isLoaded: function() {
            return this._state === LOADED_STATE;
        },
        /**
         * @return {boolean}
         */
        isAborted: function() {
            return this._state === ABORTED_STATE;
        },

        setLoaded: function() {
            var state = this;

            state._setAndLog(LOADED_STATE);
            state._queue.notify();
        },
        /**
         * @param {Object} requestInfo
         *
         * @return {boolean}
         */
        trySetRequested: function(requestInfo) {
            var state = this,
                logger = state._logger,
                isWaiting = state._state === WAITING_STATE;

            logger.info(MSG_REQUESTED);

            if(!isWaiting) {
                logger.info(stateMsgMap[state._state][ALREADY_PROGRESSED_MESSAGE]);
            }
            else {
                state._setAndLog(LOADING_STATE, requestInfo);
            }

            return isWaiting;
        },
        /**
         * @return {boolean}
         */
        trySetRegistered: function() {
            var state = this,
                canRegister = !state.isRegistered();

            if (canRegister) {
                state._setAndLog(state.isLoading() ? REGISTERED_STATE : LOADED_MANUALLY_STATE);
            }
            else {
                state._logger.warn(MSG_ALREADY_REGISTERED);
            }

            return canRegister;
        },
        /**
         * @param {string} abortionMessage
         * @param {Object} abortionInfo
         */
        setAborted: function(abortionMessage, abortionInfo) {
            var state = this;

            state._state = ABORTED_STATE;

            state._logger.error(ABORTED_LOADING + abortionMessage, abortionInfo);
            state._queue.notifyError();
        },

        onChange: function(onModuleLoaded, onModuleAborted) {
            this._queue.add(onModuleLoaded, onModuleAborted);
        }
    };

    return State;
});
