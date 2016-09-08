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
     * @param {JARS~Module} module
     * @param {Boolean} isBundleQueue
     */
    function ModuleQueue(module, isBundleQueue) {
        var moduleQueue = this;

        moduleQueue._module = module;
        moduleQueue._isBundleQueue = isBundleQueue;
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
                module = moduleQueue._module,
                name = module.getName(moduleQueue._isBundleQueue),
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
         * @param {JARS~Module~SuccessCallback} callback
         * @param {JARS~Module~FailCallback} errback
         */
        add: function(callback, errback) {
            var moduleQueue = this,
                isBundleQueue = moduleQueue._isBundleQueue,
                module = moduleQueue._module;

            if(module.state.isLoaded(isBundleQueue)) {
                callback(module.getName(isBundleQueue));
            }
            else {
                moduleQueue._callbacks.push([callback, errback]);
            }
        }
    };

    return ModuleQueue;
});
