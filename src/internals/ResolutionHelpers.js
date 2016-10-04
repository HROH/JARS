JARS.internal('ResolutionHelpers', function resolutionHelpersSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        VersionResolver = getInternal('VersionResolver'),
        InterceptionResolver = getInternal('InterceptionResolver'),
        DOT = '.',
        RE_LEADING_DOT = /^\./,
        MSG_DEFAULT_RESOLUTION_ERROR = 'Could not resolve "${mod}": ',
        MSG_VERSION_RESOLUTION_ERROR = 'a version must not be added when the parent is already versioned',
        ResolutionHelpers;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ResolutionHelpers = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        resolveAbsolute: function(baseModule, moduleName) {
            var moduleNameWithoutInterceptionData = InterceptionResolver.removeInterceptionData(moduleName),
                resolutionData = {};

            if(VersionResolver.getVersion(moduleNameWithoutInterceptionData) && baseModule && VersionResolver.getVersion(baseModule.name)) {
                resolutionData.error = MSG_VERSION_RESOLUTION_ERROR;
            }
            else if(canMakeAbsolute(baseModule, moduleNameWithoutInterceptionData)) {
                resolutionData.moduleName = baseModule ? VersionResolver.unwrapVersion(function resolveAbsolute(baseModuleName) {
                    return baseModuleName + (moduleNameWithoutInterceptionData ? DOT + moduleName : moduleName);
                })(baseModule.name) : moduleName;
            }

            return resolutionData;
        },

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

    /**
     * @memberof JARS.internals.ResolutionHelpers
     * @inner
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {boolean}
     */
    function canMakeAbsolute(baseModule, moduleName) {
        return (baseModule ? !baseModule.isRoot : moduleName) && !ResolutionHelpers.isRelative(moduleName);
    }

    return ResolutionHelpers;
});
