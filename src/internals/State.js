JARS.internal('State', function stateSetup(InternalsManager) {
    'use strict';

    var StateInfo = InternalsManager.get('StateInfo'),
        QUEUE_LOADED = 0,
        QUEUE_ABORTED = 1;

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
        state._current = StateInfo.initial();
        state._queue = [];
    }

    /**
     * @param {JARS.internals.State.LoadedCallback} onModuleLoaded
     * @param {JARS.internals.State.AbortedCallback} onModuleAborted
     */
    State.prototype.onChange = function(onModuleLoaded, onModuleAborted) {
        var state = this;

        state._queue.push([onModuleLoaded, onModuleAborted]);
        syncQueueWithState(state);
    };

    StateInfo.each(function(methodSuffix, stateToCompare) {
        State.prototype['is' + methodSuffix] = function() {
            return this._current === stateToCompare;
        };

        State.prototype['set' + methodSuffix] = function(customMessage, logInfo) {
            var state = this,
                currentState = state._current,
                canSetNextState = StateInfo.hasNext(currentState, stateToCompare),
                logMethod = StateInfo.getLogMethod(currentState, stateToCompare),
                message = StateInfo.getLogMessage(currentState, stateToCompare) + customMessage || '';

            if(canSetNextState) {
                state._current = stateToCompare;
                syncQueueWithState(state);
            }

            state._logger[logMethod](message, logInfo);

            return canSetNextState;
        };
    });

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

    /**
     * @memberof JARS.internals.State
     * @inner
     *
     * @param {JARS.internals.State} state
     */
    function syncQueueWithState(state) {
        var isLoaded = state.isLoaded(),
            queue = state._queue,
            moduleOrBundleName = state._moduleOrBundleName,
            callbackIndex;

        if(isLoaded || state.isAborted()) {
            callbackIndex = isLoaded ? QUEUE_LOADED : QUEUE_ABORTED;

            setTimeout(function() {
                while (queue.length) {
                    queue.shift()[callbackIndex](moduleOrBundleName);
                }
            }, 0);
        }
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
