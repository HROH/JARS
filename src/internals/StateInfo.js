JARS.internal('StateInfo', function stateInfoSetup(InternalsManager) {
    'use strict';

    var arrayEach = InternalsManager.get('Utils').arrayEach,
        statesInfo = [],
        LOADING = 'loading',
        LOADED = 'loaded',
        ATTEMPTED_TO = 'attempted to ',
        BUT_ALREADY = ' but is already ',
        IS_STILL_WAITING = 'is still waiting',
        NEXT_STATE = 0,
        HAS_PROGRESSED = 1,
        ATTEMPT_PROGRESSING = 2,
        ALREADY_PROGRESSED = 3,
        // Module/bundle states
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.StateInfo
         * @inner
         */
        WAITING_STATE = 0,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.StateInfo
         * @inner
         */
        LOADING_STATE = 1,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.StateInfo
         * @inner
         */
        REGISTERED_STATE = 2,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.StateInfo
         * @inner
         */
        LOADED_STATE = 3,
        /**
         * @constant {number}
         * @default
         *
         * @memberof JARS.internals.StateInfo
         * @inner
         */
        ABORTED_STATE = 4,
        StateInfo;

    statesInfo[WAITING_STATE] = [[LOADING_STATE, REGISTERED_STATE]];
    statesInfo[LOADING_STATE] = [[REGISTERED_STATE, LOADED_STATE, ABORTED_STATE], 'started ' + LOADING, 'load', LOADING];
    statesInfo[LOADED_STATE] = [[], 'finished ' + LOADING, 'finish' + LOADING, LOADED];
    statesInfo[REGISTERED_STATE] = [[LOADED_STATE, ABORTED_STATE], 'is registering...', 'register', 'registered'];
    statesInfo[ABORTED_STATE] = [[], 'aborted ' + LOADING + ' because of problems with ', 'abort', 'aborted'];

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    StateInfo = {
        /**
         * @return {number}
         */
        initial: function() {
            return WAITING_STATE;
        },
        /**
         * @param {function(string, number)} callback
         */
        each: function(callback) {
            arrayEach(statesInfo, function(info, state) {
                state !== WAITING_STATE && callback(info[ALREADY_PROGRESSED].charAt(0).toUpperCase() + info[ALREADY_PROGRESSED].substr(1), state);
            });
        },
        /**
         * @param {number} currentState
         * @param {number} nextState
         *
         * @return {boolean}
         */
        hasNext: function(currentState, nextState) {
            return statesInfo[currentState][NEXT_STATE].indexOf(nextState) > -1;
        },
        /**
         * @param {number} currentState
         * @param {number} nextState
         *
         * @return {string}
         */
        getLogMessage: function(currentState, nextState) {
            var canSetNextState = StateInfo.hasNext(currentState, nextState),
                nextProgressInfo = statesInfo[nextState],
                message;

            if(canSetNextState) {
                message = nextProgressInfo[HAS_PROGRESSED];
            }
            else {
                message = ATTEMPTED_TO + nextProgressInfo[ATTEMPT_PROGRESSING] + (currentState === WAITING_STATE ? IS_STILL_WAITING : BUT_ALREADY + statesInfo[currentState][ALREADY_PROGRESSED]);
            }

            return message;
        },
        /**
         * @param {number} currentState
         * @param {number} nextState
         *
         * @return {string}
         */
        getLogMethod: function(currentState, nextState) {
            var canSetNextState = StateInfo.hasNext(currentState, nextState),
                isNextAborted = nextState === ABORTED_STATE,
                logMethod = 'info';

            if(canSetNextState && isNextAborted) {
                logMethod = 'error';
            }
            else if((!canSetNextState && nextState === REGISTERED_STATE) || (currentState === WAITING_STATE && isNextAborted)) {
                logMethod = 'warn';
            }

            return logMethod;
        }
    };

    return StateInfo;
});
