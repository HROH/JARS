JARS.internal('StateQueue', function stateQueueSetup(InternalsManager) {
    'use strict';

    var System = InternalsManager.get('System'),
        QUEUE_SUCCESS = 0,
        QUEUE_ERROR = 1;

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {string} moduleOrBundleName
     * @param {JARS.internals.State} state
     */
    function StateQueue(moduleOrBundleName, state) {
        var stateQueue = this;

        stateQueue._moduleOrBundleName = moduleOrBundleName;
        stateQueue._state = state;
        stateQueue._callbacks = [];
    }

    StateQueue.prototype = {
        constructor: StateQueue,
        /**
         * @private
         *
         * @param {Number} callbackType
         */
        _call: function(callbackType) {
            var stateQueue = this,
                name = stateQueue._moduleOrBundleName,
                callbacks = stateQueue._callbacks,
                callback;

            while (callbacks.length) {
                callback = callbacks.shift()[callbackType];

                if (System.isFunction(callback)) {
                    callback(name);
                }
            }
        },

        notify: function() {
            this._call(QUEUE_SUCCESS);
        },

        notifyError: function() {
            this._call(QUEUE_ERROR);
        },
        /**
         * @param {JARS.internals.StateQueue.LoadedCallback} onModuleLoaded
         * @param {JARS.internals.StateQueue.AbortedCallback} onModuleAborted
         */
        add: function(onModuleLoaded, onModuleAborted) {
            var stateQueue = this;

            if(stateQueue._state.isLoaded()) {
                onModuleLoaded(stateQueue._moduleOrBundleName);
            }
            else if(stateQueue._state.isAborted()) {
                onModuleAborted(stateQueue._moduleOrBundleName);
            }
            else {
                stateQueue._callbacks.push([onModuleLoaded, onModuleAborted]);
            }
        }
    };

    /**
     * @callback JARS.internals.StateQueue.LoadedCallback
     *
     * @param {string} loadedModuleName
     */

    /**
     * @callback JARS.internals.StateQueue.AbortedCallback
     *
     * @param {string} abortedModuleName
     */

    return StateQueue;
});
