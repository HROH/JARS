JARS.internal('Handlers/Request', function() {
    'use strict';

    var MSG_REQUESTED = '${0} "${1}" requested',
        MSG_LOADED = '${0} "${1}" loaded',
        MSG_ABORTED = ' - missing ${0} "${1}"',
        SEPARATOR = '", "';

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} requestor
     * @param {string[]} modules
     * @param {string[]} msgStrings
     * @param {JARS~internals.Handlers.Request#onModulesLoaded} onModulesLoaded
     */
    function Request(requestor, modules, msgStrings, onModulesLoaded) {
        var handler = this;

        handler.requestor = requestor;
        handler.modules = modules;
        handler._msgStrings = msgStrings;
        handler.onModulesLoaded = onModulesLoaded;

        modules.length && requestor.logger.debug(MSG_REQUESTED, [msgStrings[1] || msgStrings[0], modules.join(SEPARATOR)]);
    }

    Request.prototype = {
        constructor: Request,
        /**
         * @param {string} loadedModuleName
         */
        onModuleLoaded: function(loadedModuleName) {
            this.requestor.logger.debug(MSG_LOADED, [this._msgStrings[0], loadedModuleName]);
        },
        /**
         * @param {string} abortedModuleName
         */
        onModuleAborted: function(abortedModuleName) {
            this.requestor.state.setAborted(MSG_ABORTED, [this._msgStrings[0], abortedModuleName]);
        }
    };

    /**
     * @method JARS~internals.Handlers.Request#onModulesLoaded
     *
     * @param {JARS~internals.Refs.Modules} ref
     */

    return Request;
});
