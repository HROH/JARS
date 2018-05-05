JARS.internal('State/Subject', function(getInternal) {
    'use strict';

    var States = getInternal('State/States');

    /**
     * @class
     *
     * @memberof JARS~internals.State
     *
     * @param {string} subjectName
     */
    function Subject(subjectName) {
        this._subjectName = subjectName;
        this._current = States.WAITING;
        this._queue = [];
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {JARS~internals.Handlers.Modules} changeHandler
         */
        onChange: function(changeHandler) {
            this._queue.push(changeHandler);
            this._syncQueue();
        },
        /**
         * @private
         */
        _syncQueue: function() {
            var state = this,
                isLoaded = state.is(States.LOADED);

            if(isLoaded || state.is(States.ABORTED)) {
                while(state._queue.length) {
                    state._queue.shift()[isLoaded ? 'onLoaded' : 'onAborted'](state._subjectName);
                }
            }
        },
        /**
         * @param {string} state
         *
         * @return {boolean}
         */
        is: function(state) {
            return this._current === state;
        },
        /**
         * @param {string} nextState
         * @param {JARS~internals.State.Subject~TransitionCallback} callback
         *
         * @return {boolean}
         */
        set: function(nextState, callback) {
            var state = this,
                canTransition = States.hasNext(state._current, nextState);

            callback(canTransition, state._current, nextState);

            if(canTransition) {
                state._current = nextState;
                state._syncQueue();
            }

            return canTransition;
        }
    };

    /**
     * @callback JARS~internals.State.Subject~TransitionCallback
     *
     * @param {boolean} canTransition
     * @param {string} currentState
     * @param {string} nextState
     */

    return Subject;
});
