JARS.internal('State/States', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        STATES = ['waiting', 'loading', 'registered', 'intercepted', 'loaded', 'aborted'],
        nextStates = {},
        States;

    /**
     * @namespace
     *
     * @memberof JARS~internals.State
     */
    States = {
        /**
         * @param {JARS~internals.Helpers.Array~Callback} callback
         */
        each: function(callback) {
            each(STATES, callback);
        },
        /**
         * @param {string} currentState
         * @param {string} nextState
         *
         * @return {boolean}
         */
        hasNext: function(currentState, nextState) {
            return nextStates[currentState][nextState] || false;
        }
    };

    States.each(function(state) {
        States[state.toUpperCase()] = state;
        nextStates[state] = {};
    });

    /**
     * @memberof JARS~internals.State.States
     * @inner
     *
     * @param {string} state
     * @param {string[]} next
     */
    function setNext(state, next) {
        each(next, function(nextState) {
            nextStates[state][nextState] = true;
        });
    }

    setNext(States.WAITING, [States.LOADING, States.REGISTERED, States.ABORTED]);
    setNext(States.LOADING, [States.REGISTERED, States.ABORTED]);
    setNext(States.REGISTERED, STATES.slice(3));
    setNext(States.INTERCEPTED, STATES.slice(3));
    setNext(States.LOADED, [States.WAITING]);
    setNext(States.ABORTED, [States.WAITING]);

    return States;
});
