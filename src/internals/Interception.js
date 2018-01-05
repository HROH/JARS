JARS.internal('Interception', function interceptionSetup(getInternal) {
    'use strict';

    var InterceptionRef = getInternal('Refs/Interception'),
        getFullPath = getInternal('Resolvers/Path').getFullPath,
        MSG_MODULE_INTERCEPTED = ' - handling request of "${fullModuleName}"',
        MSG_INTERCEPTION_ERROR = ' - error in interception of module "${moduleName}" by interceptor "${type}" with data "${data}"';

    /**
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {JARS.internals.Module} requestor
     * @param {JARS.internals.InterceptionInfo} interceptionInfo
     * @param {JARS.internals.StateChangeHandler} handler
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

        $import: function(dependencies) {
            this._exported || this.deps.add(dependencies);
        },

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
         * @param {JARS.internals.Dependencies.Declaration} moduleNames
         * @param {function()} onModulesLoaded
         */
        $importAndLink: function(moduleNames, onModulesLoaded) {
            this.$import(moduleNames);
            this.$export(onModulesLoaded);
        },

        success: function(data) {
            this.$export(function() {
                return data;
            });
        },

        fail: function(error) {
            this.requestor.state.setAborted(MSG_INTERCEPTION_ERROR + (error ? ': ' + error : ''), this.info);
            this._handler.onModuleAborted(this.info.fullModuleName);
        }
    };

    return Interception;
});
