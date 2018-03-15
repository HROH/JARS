JARS.internal('States/Subject', function(getInternal) {
    'use strict';

    var StateInfo = getInternal('States/Info');

    /**
     * @class
     *
     * @memberof JARS~internals.States
     *
     * @param {string} subjectName
     */
    function Subject(subjectName) {
        this._subjectName = subjectName;
        this._current = StateInfo.initial();
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
                isLoaded = state.isLoaded();

            if(isLoaded || state.isAborted()) {
                while(state._queue.length) {
                    state._queue.shift()[isLoaded ? 'onLoaded' : 'onAborted'](state._subjectName);
                }
            }
        },
        /**
         * @private
         *
         * @param {JARS~internals.States.Info} stateInfo
         *
         * @return {boolean}
         */
        _is: function(stateInfo) {
            return this._current === stateInfo;
        },
        /**
         * @param {JARS~internals.States.Info} stateInfo
         * @param {function(canTransition: boolean, currentStateInfo: JARS~internals.States.Info, nextStateInfo: JARS~internals.States.Info)} callback
         *
         * @return {boolean}
         */
        set: function(stateInfo, callback) {
            var state = this,
                canTransition = state._current.hasNext(stateInfo);

            callback(canTransition, state._current, stateInfo);

            if(canTransition) {
                state._current = stateInfo;
                state._syncQueue();
            }

            return canTransition;
        }
    };

    StateInfo.each(function(stateInfo) {
        Subject.prototype[stateInfo.is] = function() {
            return this._is(stateInfo);
        };
    });

    /**
     * @method JARS~internals.States.Subject#isWaiting
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#isLoading
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#isRegistered
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#isIntercepted
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#isLoaded
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#isAborted
     *
     * @return {boolean}
     */

    return Subject;
});
