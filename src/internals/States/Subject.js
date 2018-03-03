JARS.internal('States/Subject', function(getInternal) {
    'use strict';

    var StateInfo = getInternal('States/Info'),
        merge = getInternal('Helpers/Object').merge,
        MSG_ATTEMPT = 'attempted to mark as ${nextState} but is currently ${curState}',
        MSG_DONE = 'is ${nextState}',
        LOG_ATTEMPT = 'attempt',
        LOG_DONE = 'done';

    /**
     * @class
     *
     * @memberof JARS~internals.States
     *
     * @param {JARS~internals.Subjects.Subject} subject
     */
    function Subject(subject) {
        this._subject = subject;
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
                    state._queue.shift()[isLoaded ? 'onLoaded' : 'onAborted'](state._subject);
                }
            }
        },
        /**
         * @private
         *
         * @param {JARS~internals.State.Info} stateInfo
         *
         * @return {boolean}
         */
        _is: function(stateInfo) {
            return this._current === stateInfo;
        },
        /**
         * @private
         *
         * @param {JARS~internals.State.Info} stateInfo
         * @param {string} [message]
         * @param {Object} [logInfo]
         *
         * @return {boolean}
         */
        _set: function(stateInfo, message, logInfo) {
            var state = this,
                canTransition = state._current.hasNext(stateInfo);

            logInfo = merge(merge({
                curState: state._current.text,

                nextState: stateInfo.text
            }, stateInfo.methods), logInfo);

            state._subject.logger[logInfo[canTransition ? LOG_DONE : LOG_ATTEMPT]]((canTransition ? MSG_DONE : MSG_ATTEMPT) + (message ? ' - ' + message : ''), logInfo);

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

        Subject.prototype[stateInfo.set] = function(customMessage, logInfo) {
            return this._set(stateInfo, customMessage, logInfo);
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

    /**
     * @method JARS~internals.States.Subject#setWaiting
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#setLoading
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#setRegistered
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#setIntercepted
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#setLoaded
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Subject#setAborted
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    return Subject;
});
