JARS.internal('State/States', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        states = ['waiting', 'loading', 'registered', 'intercepted', 'loaded', 'aborted'],
        nextStates = {},
        States;

    /**
     * @namespace
     *
     * @memberof JARS~internals.State
     */
    States = {
        /**
         * @param {function(string)} callback
         */
        each: function(callback) {
            each(states, callback);
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

    function setNext(state, next) {
        each(next, function(nextState) {
            nextStates[state][nextState] = true;
        });
    }

    setNext(States.WAITING, [States.LOADING, States.REGISTERED, States.ABORTED]);
    setNext(States.LOADING, [States.REGISTERED, States.ABORTED]);
    setNext(States.REGISTERED, states.slice(3));
    setNext(States.INTERCEPTED, states.slice(3));
    setNext(States.LOADED, [States.WAITING]);
    setNext(States.ABORTED, [States.WAITING]);

    return States;
});
