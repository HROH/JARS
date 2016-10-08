JARS.internal('ResolutionHelpers', function resolutionHelpersSetup() {
    'use strict';

    var RE_LEADING_DOT = /^\./,
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${mod}": ',
        ResolutionHelpers;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ResolutionHelpers = {
        /**
         * @param {JARS.internals.ResolutionStrategy} resolve
         * @param {function(JARS.internals.Module):JARS.internals.Logger} getLogger
         * @param {string} errorMessage
         *
         * @return {string}
         */
        logResolutionError: function(resolve, getLogger, errorMessage) {
            return function wrappedResolve(baseModule, moduleName) {
                var resolutionData = resolve(baseModule, moduleName);

                if(resolutionData.error || !resolutionData.moduleName) {
                    getLogger(baseModule).error(MSG_DEFAULT_RESOLUTION_ERROR + (resolutionData.error || errorMessage), {
                        mod: moduleName
                    });
                }

                return resolutionData.moduleName;
            };
        },
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isRelative: function(moduleName) {
            return RE_LEADING_DOT.test(moduleName);
        }
    };

    return ResolutionHelpers;
});
