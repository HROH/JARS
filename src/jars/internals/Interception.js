JAR.internal('Interception', function interceptionSetup(InternalsManager) {
    var Resolver = InternalsManager.get('Resolver');

    /**
     * @access private
     *
     * @constructor Interception
     *
     * @memberof JAR
     * @inner
     *
     * @param {JAR~Loader} loader
     * @param {String} listener
     * @param {Object} interceptorInfo
     * @param {JAR~Module~successCallback} callback
     * @param {JAR~Module~failCallback} errback
     */
    function Interception(loader, listener, interceptorInfo, callback, errback) {
        var interception = this;

        interception.listener = listener;
        interception.info = interceptorInfo;
        interception.loader = loader;
        interception._callback = callback;
        interception._errback = errback;
    }

    Interception.prototype = {
        /**
         * @access public
         *
         * @alias JAR~Interception
         *
         * @memberof JAR~Interception#
         */
        constructor: Interception,
        /**
         * @access public
         *
         * @param {String} fileType
         *
         * @return {String}
         *
         * @memberof JAR~Interception#
         */
        getFilePath: function(fileType) {
            return !Resolver.isRootName(this.listener) && this.loader.getModule(this.listener).getFullPath(fileType);
        },
        /**
         * @access public
         *
         * @param {Array} moduleNames
         * @param {Function()} callback
         * @param {JAR~Module~failCallback} errback
         * @param {Function()} progressback
         *
         * @memberof JAR~Interception#
         */
        $import: function(moduleNames, callback, errback, progressback) {
            this.loader.$import(moduleNames, callback, errback, progressback);
        },
        /**
         * @access public
         *
         * @param {Array} moduleNames
         * @param {Function()} callback
         * @param {JAR~Module~failCallback} [errback]
         * @param {Function()} [progressback]
         *
         * @memberof JAR~Interception#
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
         * @param {*} data
         *
         * @memberof JAR~Interception#
         */
        success: function(data) {
            var info = this.info;

            this._callback(info.moduleName + info.type + info.data, data);
        },
        /**
         * @access public
         *
         * @param {String} error
         *
         * @memberof JAR~Interception#
         */
        fail: function(error) {
            var info = this.info,
                dependency = info.moduleName;

            this.loader.getModule(dependency).state.logInterceptorError(info, error);

            this._errback(info.moduleName + info.type + info.data);
        }
    };

    return Interception;
});
