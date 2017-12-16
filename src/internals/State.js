JARS.internal('State', function stateSetup(getInternal) {
    'use strict';

    var StateInfo = getInternal('StateInfo'),
        ATTEMPTED_TO = 'attempted to mark as ',
        BUT_CURRENTLY = ' but is currently ',
        DONE = 'is ',
        IS_PREFIX = 'is',
        SET_PREFIX = 'set',
        QUEUE_LOADED = 'onModuleLoaded',
        QUEUE_ABORTED = 'onModuleAborted';

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {(JARS.internals.Module|JARS.internals.Bundle)} subject
     */
    function State(subject) {
        var state = this;

        state._subject = subject;
        state._current = StateInfo.initial();
        state._queue = [];
    }

    /**
     * @param {(JARS.internals.StateChangeHandler|JARS.internals.InterceptionHandler)} changeHandler
     */
    State.prototype.onChange = function(changeHandler) {
        var state = this;

        state._queue.push(changeHandler);
        state._syncQueue();
    };

    StateInfo.each(function(stateInfo) {
        var methods = stateInfo.methods,
            stateText = stateInfo.text,
            capitalStateText = stateText.charAt(0).toUpperCase() + stateText.substr(1),
            attemptMsg = ATTEMPTED_TO + stateText,
            doneMsg = DONE + stateText;

        State.prototype[IS_PREFIX + capitalStateText] = function() {
            return this._current === stateInfo;
        };

        State.prototype[SET_PREFIX + capitalStateText] = function(customMessage, logInfo) {
            var state = this,
                currentStateInfo = state._current,
                canTransition = currentStateInfo.hasNext(stateInfo),
                message, method;

            if(canTransition) {
                message = doneMsg  + (customMessage || '');
                method = (logInfo && logInfo.log) || methods.done;
                state._current = stateInfo;
                state._syncQueue();
            }
            else {
                message = attemptMsg + BUT_CURRENTLY + currentStateInfo.text;
                method = methods.attempt;
            }

            state._subject.logger[method](message, logInfo);

            return canTransition;
        };
    });

   /**
    * @private
    */
    State.prototype._syncQueue = function() {
        var state = this,
            isLoaded = state.isLoaded(),
            queue = state._queue,
            subject = state._subject,
            callbackMethod;

        if(isLoaded || state.isAborted()) {
            callbackMethod = isLoaded ? QUEUE_LOADED : QUEUE_ABORTED;

            setTimeout(function() {
                while (queue.length) {
                    queue.shift()[callbackMethod](subject.name, {
                        ref: subject.ref
                    });
                }
            }, 0);
        }
   };

    /**
     * @method JARS.internals.State#isWaiting
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#isLoading
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#isRegistered
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#isLoaded
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#isAborted
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#setWaiting
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#setLoading
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#setRegistered
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#setLoaded
     *
     * @return {boolean}
     */

    /**
     * @method JARS.internals.State#setAborted
     *
     * @param {string} message
     * @param {Object} abortionInfo
     *
     * @return {boolean}
     */

    return State;
});
