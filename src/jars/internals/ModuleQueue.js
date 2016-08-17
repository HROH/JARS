JARS.internal('ModuleQueue', function() {
    'use strict';

    var QUEUE_SUCCESS = 0,
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
     */
    function ModuleQueue(module) {
        var moduleQueue = this;

        moduleQueue._module = module;
        moduleQueue._depsCallbacks = [];
        moduleQueue._bundleCallbacks = [];
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
         * @param {Boolean} forBundle
         *
         * @return {Array}
         */
        _getCallbacks: function(forBundle) {
            return this[(forBundle ? '_bundle' : '_deps') + 'Callbacks'];
        },
        /**
         * @access private
         *
         * @memberof JARS~ModuleQueue#
         *
         * @param {Number} callbackType
         * @param {Boolean} callBundle
         */
        _call: function(callbackType, callBundle) {
            var moduleQueue = this,
                module = moduleQueue._module,
                name = module.getName(callBundle),
                System = module.loader.getSystem(),
                callbacks = moduleQueue._getCallbacks(callBundle),
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
         *
         * @param {Boolean} callBundle
         */
        notify: function(callBundle) {
            this._call(QUEUE_SUCCESS, callBundle);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleQueue#
         *
         * @param {Boolean} callBundle
         */
        notifyError: function(callBundle) {
            this._call(QUEUE_ERROR, callBundle);
        },
        /**
         * @access public
         *
         * @memberof JARS~ModuleQueue#
         *
         * @param {JARS~Module~SuccessCallback} callback
         * @param {JARS~Module~FailCallback} errback
         * @param {Boolean} addBundle
         */
        add: function(callback, errback, addBundle) {
            this._getCallbacks(addBundle).push([callback, errback]);
        }
    };

    return ModuleQueue;
});
