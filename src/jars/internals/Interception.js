JARS.internal('Interception', function interceptionSetup(InternalsManager) {
    'use strict';

    var Resolver = InternalsManager.get('Resolver'),
        ModuleLogger = InternalsManager.get('ModuleLogger'),
        MSG_INTERCEPTION_ERROR = ModuleLogger.addError('error in interception of this module by interceptor "${type}" with data "${data}"');

    /**
     * @access public
     *
     * @constructor Interception
     *
     * @memberof JARS
     * @inner
     *
     * @param {JARS~Loader} loader
     * @param {String} listener
     * @param {JARS~InterceptionManager~InterceptionInfo} interceptionInfo
     * @param {JARS~Module~SuccessCallback} callback
     * @param {JARS~Module~FailCallback} errback
     */
    function Interception(loader, listener, interceptionInfo, callback, errback) {
        var interception = this;

        interception.listener = listener;
        interception.info = interceptionInfo;
        interception.loader = loader;
        interception._callback = callback;
        interception._errback = errback;
    }

    Interception.prototype = {
        /**
         * @access public
         *
         * @alias JARS~Interception
         *
         * @memberof JARS~Interception#
         */
        constructor: Interception,
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {String} fileType
         *
         * @return {String}
         */
        getFilePath: function(fileType) {
            return !Resolver.isRootName(this.listener) && this.loader.getModule(this.listener).getFullPath(fileType);
        },
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {JARS~Module~DependencyDefinition} moduleNames
         * @param {Function()} callback
         * @param {JARS~Module~FailCallback} [errback]
         * @param {Function()} [progressback]
         */
        $import: function(moduleNames, callback, errback, progressback) {
            this.loader.$import(moduleNames, callback, errback, progressback);
        },
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {Array} moduleNames
         * @param {Function()} callback
         * @param {JARS~Module~FailCallback} [errback]
         * @param {Function()} [progressback]
         */
        $importAndLink: function(moduleNames, callback, errback, progressback) {
            var interceptorDeps;

            moduleNames = Resolver.resolve(moduleNames, this.info.moduleName);

            if (!Resolver.isRootName(this.listener)) {
                interceptorDeps = this.loader.getModule(this.listener).interceptorDeps;
                interceptorDeps.push.apply(interceptorDeps, moduleNames);
            }

            this.$import(moduleNames, callback, errback, progressback);
        },
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {*} data
         */
        success: function(data) {
            var info = this.info;

            this._callback(info.moduleName + info.type + info.data, data);
        },
        /**
         * @access public
         *
         * @memberof JARS~Interception#
         *
         * @param {(String|Error)} error
         */
        fail: function(error) {
            var info = this.info,
                dependency = info.moduleName;

            this.loader.getModule(dependency).logger.log(error || MSG_INTERCEPTION_ERROR, info);

            this._errback(info.moduleName + info.type + info.data);
        }
    };

    return Interception;
});
