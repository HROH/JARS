JARS.internal('ModuleQueue', function moduleQueueSetup(InternalsManager) {
    'use strict';

    var System = InternalsManager.get('System'),
        QUEUE_SUCCESS = 0,
        QUEUE_ERROR = 1;

    /**
     * @access public
     *
     * @constructor ModuleQueue
     *
     * @memberof JARS
     * @inner
     *
     * @param {String} moduleOrBundleName
     * @param {JARS~ModuleState} state
     */
    function ModuleQueue(moduleOrBundleName, state) {
        var moduleQueue = this;

        moduleQueue._moduleOrBundleName = moduleOrBundleName;
        moduleQueue._state = state;
        moduleQueue._callbacks = [];
    }

    ModuleQueue.prototype = {
        /**
         * @access public
         *
         * @alias JARS~ModuleQueue
         *
         * @memberof JARS~ModuleQueue#
         */
        constructor: ModuleQueue,
        /**
         * @access private
         *
         * @memberof JARS~ModuleQueue#
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
        /**
         * @access public
         *
         * @memberof JARS~ModuleQueue#
         */
        notify: function() {
            this._call(QUEUE_SUCCESS);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleQueue#
         */
        notifyError: function() {
            this._call(QUEUE_ERROR);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleQueue#
         *
         * @param {JARS~ModuleQueue~SuccessCallback} onQueueSuccess
         * @param {JARS~ModuleQueue~FailCallback} onQueueFail
         */
        add: function(onQueueSuccess, onQueueFail) {
            var moduleQueue = this;

            if(moduleQueue._state.isLoaded()) {
                onQueueSuccess(moduleQueue._moduleOrBundleName);
            }
            else {
                moduleQueue._callbacks.push([onQueueSuccess, onQueueFail]);
            }
        }
    };

    /**
     * @callback SuccessCallback
     *
     * @memberof JARS~ModuleQueue
     * @inner
     *
     * @param {String} loadedModuleName
     */

    /**
     * @callback FailCallback
     *
     * @memberof JARS~ModuleQueue
     * @inner
     *
     * @param {String} abortedModuleName
     */

    return ModuleQueue;
});
