JARS.internal('State', function stateSetup() {
    'use strict';

    var stateMsgMap = {},
        LOADING = 'loading',
        LOADED = 'loaded',
        ATTEMPTED_TO = 'attempted to ',
        ATTEMPTED_TO_LOAD = ATTEMPTED_TO + 'load',
        BUT_ALREADY = ' but is already ',
        ABORTED_LOADING = 'aborted ' + LOADING + ' because of problems with ',
        // Show module or bundle is requested
        MSG_REQUESTED = 'was requested',
        // Show loading progress for module or bundle
        MSG_LOADED = 'finished ' + LOADING,
        MSG_LOADING = 'started ' + LOADING,
        MSG_REGISTERING = 'is registering...',
        // Info when loading is already in progress, done or aborted
        MSG_ALREADY_LOADED = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADED,
        MSG_ALREADY_LOADING = ATTEMPTED_TO_LOAD + BUT_ALREADY + LOADING,
        MSG_ALEADY_ABORTED = ATTEMPTED_TO_LOAD + BUT_ALREADY + 'aborted',
        // Warning when a module is registered twice
        MSG_ALREADY_REGISTERED = ATTEMPTED_TO + 'register' + BUT_ALREADY + 'registered',
        PROGRESS_MESSAGE = 0,
        ALREADY_PROGRESSED_MESSAGE = 1,
        QUEUE_LOADED = 0,
        QUEUE_ABORTED = 1,
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
        REGISTERED_STATE = 3,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        LOADED_STATE = 4,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.State
         * @inner
         */
        ABORTED_STATE = 5;

    stateMsgMap[LOADING_STATE] = [MSG_LOADING, MSG_ALREADY_LOADING];
    stateMsgMap[LOADED_STATE] = [MSG_LOADED, MSG_ALREADY_LOADED];
    stateMsgMap[REGISTERED_STATE] = [MSG_REGISTERING, MSG_ALREADY_REGISTERED];
    stateMsgMap[ABORTED_STATE] = [null, MSG_ALEADY_ABORTED];

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {string} moduleOrBundleName
     * @param {JARS.internals.Logger} logger
     */
    function State(moduleOrBundleName, logger) {
        var state = this;

        state._moduleOrBundleName = moduleOrBundleName;
        state._logger = logger;
        state._state = WAITING_STATE;
        state._queue = [];
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
         * @method
         *
         * @return {boolean}
         */
        isLoading: comparerFor(LOADING_STATE),
        /**
         * @method
         *
         * @return {boolean}
         */
        isRegistered: comparerFor(REGISTERED_STATE),
        /**
         * @method
         *
         * @return {boolean}
         */
        isLoaded: comparerFor(LOADED_STATE),
        /**
         * @method
         *
         * @return {boolean}
         */
        isAborted: comparerFor(ABORTED_STATE),

        setLoaded: function() {
            var state = this;

            state._setAndLog(LOADED_STATE);
            syncQueueWithState(state);
        },
        /**
         * @param {Object} requestInfo
         *
         * @return {boolean}
         */
        setLoading: function(requestInfo) {
            var state = this,
                logger = state._logger,
                currentState = state._state,
                isWaiting = currentState === WAITING_STATE;

            logger.info(MSG_REQUESTED);

            if(!isWaiting) {
                logger.info(stateMsgMap[currentState][ALREADY_PROGRESSED_MESSAGE]);
            }
            else {
                state._setAndLog(LOADING_STATE, requestInfo);
            }

            return isWaiting;
        },
        /**
         * @return {boolean}
         */
        setRegistered: function() {
            var state = this,
                canRegister = !(state.isRegistered() || state.isLoaded());

            if (canRegister) {
                state._setAndLog(REGISTERED_STATE);
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

            if(!state.isAborted()) {
                state._state = ABORTED_STATE;

                state._logger.error(ABORTED_LOADING + abortionMessage, abortionInfo);
                syncQueueWithState(state);
            }
        },
        /**
         * @param {JARS.internals.State.LoadedCallback} onModuleLoaded
         * @param {JARS.internals.State.AbortedCallback} onModuleAborted
         */
        onChange: function(onModuleLoaded, onModuleAborted) {
            var state = this;

            state._queue.push([onModuleLoaded, onModuleAborted]);
            syncQueueWithState(state);
        }
    };

   /**
    * @memberof JARS.internals.State
    * @inner
    *
    * @param {JARS.internals.State} state
    */
    function syncQueueWithState(state) {
        var queue = state._queue,
            moduleOrBundleName = state._moduleOrBundleName,
            callbackIndex;

        if(state.isLoaded() || state.isAborted()) {
            callbackIndex = state.isLoaded() ? QUEUE_LOADED : QUEUE_ABORTED;

            while (queue.length) {
                queue.shift()[callbackIndex](moduleOrBundleName);
            }
        }
    }

   /**
    * @memberof JARS.internals.State
    * @inner
    *
    * @param {number} state
    *
    * @return {function(this:JARS.internals.State):boolean}
    */
    function comparerFor(stateToCompare) {
        return function compareState() {
            return this._state === stateToCompare;
        };
    }

    /**
     * @callback JARS.internals.State.LoadedCallback
     *
     * @param {string} loadedModuleName
     */

    /**
     * @callback JARS.internals.State.AbortedCallback
     *
     * @param {string} abortedModuleName
     */

    return State;
});
