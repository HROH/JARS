JARS.internal('ModuleQueue', function moduleQueueSetup(InternalsManager) {
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
     * @param {JARS.internals.ModuleState} state
     */
    function ModuleQueue(moduleOrBundleName, state) {
        var moduleQueue = this;

        moduleQueue._moduleOrBundleName = moduleOrBundleName;
        moduleQueue._state = state;
        moduleQueue._callbacks = [];
    }

    ModuleQueue.prototype = {
        constructor: ModuleQueue,
        /**
         * @private
         *
         * @param {Number} callbackType
         */
        _call: function(callbackType) {
            var moduleQueue = this,
                name = moduleQueue._moduleOrBundleName,
                callbacks = moduleQueue._callbacks,
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
         * @param {JARS.internals.ModuleQueue.SuccessCallback} onQueueSuccess
         * @param {JARS.internals.ModuleQueue.FailCallback} onQueueFail
         */
        add: function(onQueueSuccess, onQueueFail) {
            var moduleQueue = this;

            if(moduleQueue._state.isLoaded()) {
                onQueueSuccess(moduleQueue._moduleOrBundleName);
            }
            else if(moduleQueue._state.isAborted()) {
                onQueueFail(moduleQueue._moduleOrBundleName);
            }
            else {
                moduleQueue._callbacks.push([onQueueSuccess, onQueueFail]);
            }
        }
    };

    /**
     * @callback JARS.internals.ModuleQueue.SuccessCallback
     *
     * @param {string} loadedModuleName
     */

    /**
     * @callback JARS.internals.ModuleQueue.FailCallback
     *
     * @param {string} abortedModuleName
     */

    return ModuleQueue;
});
