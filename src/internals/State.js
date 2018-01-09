JARS.internal('State', function(getInternal) {
    'use strict';

    var StateInfo = getInternal('StateInfo'),
        merge = getInternal('Helpers/Object').merge,
        ATTEMPT_MSG = 'attempted to mark as ${nextState} but is currently ${curState}',
        DONE_MSG = 'is ${nextState}',
        QUEUE_LOADED = 'onModuleLoaded',
        QUEUE_ABORTED = 'onModuleAborted';

    /**
     * @class
     *
     * @memberof JARS~internals
     *
     * @param {JARS~internals.Subjects~Subject} subject
     */
    function State(subject) {
        this._subject = subject;
        this._current = StateInfo.initial();
        this._queue = [];
    }

    /**
     * @param {(JARS~internals.Handlers.StateChange|JARS~internals.Handlers.Interception)} changeHandler
     */
    State.prototype.onChange = function(changeHandler) {
        this._queue.push(changeHandler);
        this._syncQueue();
    };

    StateInfo.each(function(stateInfo) {
        State.prototype[stateInfo.is] = function() {
            return this._current === stateInfo;
        };

        State.prototype[stateInfo.set] = function(customMessage, logInfo) {
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
    State.prototype._syncQueue = function() {
        var state = this,
            isLoaded = state.isLoaded();

        if(isLoaded || state.isAborted()) {
            drainQueue(state._queue, isLoaded ? QUEUE_LOADED : QUEUE_ABORTED, state._subject);
        }
    };

    /**
     * @param {Array<(JARS~internals.Handlers.StateChange|JARS~internals.Handlers.Interception)>} queue
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
     * @method JARS~internals.State#isWaiting
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#isLoading
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#isRegistered
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#isIntercepted
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#isLoaded
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#isAborted
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#setWaiting
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#setLoading
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#setRegistered
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#setIntercepted
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#setLoaded
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.State#setAborted
     *
     * @param {string} message
     * @param {Object} abortInfo
     *
     * @return {boolean}
     */

    return State;
});
