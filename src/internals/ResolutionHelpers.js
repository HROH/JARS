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
         * @param {string} errorMessage
         * @param {boolean} useBundleLogger
         *
         * @return {string}
         */
        logResolutionError: function(resolve, errorMessage, useBundleLogger) {
            return function wrappedResolve(baseModule, moduleName) {
                var logger = (useBundleLogger ? baseModule.bundle : baseModule).logger,
                    resolutionData = resolve(baseModule, moduleName);

                if(resolutionData.error || !resolutionData.moduleName) {
                    logger.error(MSG_DEFAULT_RESOLUTION_ERROR + (resolutionData.error || errorMessage), {
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
