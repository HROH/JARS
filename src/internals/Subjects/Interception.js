JARS.internal('Subjects/Interception', function(getInternal) {
    'use strict';

    var InterceptionRef = getInternal('Refs/Interception'),
        getFullPath = getInternal('Resolvers/Path').getFullPath,
        MSG_MODULE_INTERCEPTED = ' - handling request of "${fullModuleName}"',
        MSG_INTERCEPTION_ERROR = ' - error in interception of module "${moduleName}" by interceptor "${type}" with data "${data}"';

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects
     *
     * @param {JARS~internals.Subjects.Module} requestor
     * @param {JARS~internals.Subjects.Interception~Info} interceptionInfo
     * @param {JARS~internals.Handlers.StateChange} handler
     */
    function Interception(requestor, interceptionInfo, handler, ref) {
        var interception = this;

        interception.requestor = requestor;
        interception.deps = requestor.interceptionDeps.get(interceptionInfo.fullModuleName);
        interception.ref = ref;
        interception.info = interceptionInfo;
        interception._handler = handler;

        requestor.state.setIntercepted(MSG_MODULE_INTERCEPTED, interceptionInfo);
    }

    Interception.prototype = {
        constructor: Interception,
        /**
         * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} dependencies
         */
        $import: function(dependencies) {
            this._exported || this.deps.add(dependencies);
        },
        /**
         * @param {function()} provide
         */
        $export: function(provide) {
            var interception = this;

            if(!interception._exported) {
                interception._exported = true;
                interception.deps.request(function(dependencyRefs) {
                    interception._handler.onModuleLoaded(interception.info.fullModuleName, {
                        ref: new InterceptionRef(interception.ref, dependencyRefs, provide)
                    });
                });
            }
        },
        /**
         * @param {string} fileType
         *
         * @return {string}
         */
        getFilePath: function(fileType) {
            return getFullPath(this.requestor, fileType);
        },
        /**
         * @param {JARS~internals.Subjects.Dependencies.Module~Declaration} moduleNames
         * @param {function()} provide
         */
        $importAndLink: function(moduleNames, provide) {
            this.$import(moduleNames);
            this.$export(provide);
        },
        /**
         * @param {*} data
         */
        success: function(data) {
            this.$export(function() {
                return data;
            });
        },
        /**
         * @param {string} error
         */
        fail: function(error) {
            this.requestor.state.setAborted(MSG_INTERCEPTION_ERROR + (error ? ': ' + error : ''), this.info);
            this._handler.onModuleAborted(this.info.fullModuleName);
        }
    };

    /**
     * @typedef {Object} Info
     *
     * @memberof JARS~internals.Subjects.Interception
     * @inner
     *
     * @property {string} fullModuleName
     * @property {string} moduleName
     * @property {string} type
     * @property {string} data
     */

    return Interception;
});
