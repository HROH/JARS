JARS.internal('States/Subject', function(getInternal) {
    'use strict';

    var StateInfo = getInternal('States/Info'),
        merge = getInternal('Helpers/Object').merge,
        ATTEMPT_MSG = 'attempted to mark as ${nextState} but is currently ${curState}',
        DONE_MSG = 'is ${nextState}',
        QUEUE_LOADED = 'onModuleLoaded',
        QUEUE_ABORTED = 'onModuleAborted';

    /**
     * @class
     *
     * @memberof JARS~internals.States
     *
     * @param {JARS~internals.Subjects~Subject} subject
     */
    function Subject(subject) {
        this._subject = subject;
        this._current = StateInfo.initial();
        this._queue = [];
    }

    /**
     * @param {JARS~internals.Handlers~StateChange} changeHandler
     */
    Subject.prototype.onChange = function(changeHandler) {
        this._queue.push(changeHandler);
        this._syncQueue();
    };

    StateInfo.each(function(stateInfo) {
        Subject.prototype[stateInfo.is] = function() {
            return this._current === stateInfo;
        };

        Subject.prototype[stateInfo.set] = function(customMessage, logInfo) {
            var state = this,
                canTransition = state._current.hasNext(stateInfo);

            logInfo = merge(merge({
                curState: state._current.text,

                nextState: stateInfo.text
            }, stateInfo.methods), logInfo);

            state._subject.logger[logInfo[canTransition ? 'done' : 'attempt']](canTransition ? DONE_MSG + (customMessage || '') : ATTEMPT_MSG, logInfo);

            if(canTransition) {
                state._current = stateInfo;
                state._syncQueue();
            }

            return canTransition;
        };
    });

    /**
     * @private
     */
    Subject.prototype._syncQueue = function() {
        var state = this,
            isLoaded = state.isLoaded();

        if(isLoaded || state.isAborted()) {
            drainQueue(state._queue, isLoaded ? QUEUE_LOADED : QUEUE_ABORTED, state._subject);
        }
    };

    /**
     * @param {JARS~internals.Handlers~StateChange[]} queue
     * @param {string} method
     * @param {JARS~internals.Subjects~Subject} subject
     */
    function drainQueue(queue, method, subject) {
        while(queue.length) {
            queue.shift()[method](subject.name, {
                ref: subject.ref
            });
        }
    }

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
