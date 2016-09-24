JARS.internal('ResolutionHelpers', function(InternalsManager) {
    'use strict';

    var VersionResolver = InternalsManager.get('VersionResolver'),
        DOT = '.',
        RE_LEADING_DOT = /^\./,
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
         * @param {string} errorMessage
         *
         * @return {string}
         */
        makeAbsolute: function(baseModule, moduleName, errorMessage) {
            var resolutionInfo = {},
                moduleNameWithoutInterceptionData = InternalsManager.get('InterceptionManager').removeInterceptionData(moduleName);

            if(VersionResolver.getVersion(moduleNameWithoutInterceptionData) && baseModule && VersionResolver.getVersion(baseModule.name)) {
                resolutionInfo.error = MSG_VERSION_RESOLUTION_ERROR;
            }
            else if(!canMakeAbsolute(baseModule, moduleNameWithoutInterceptionData)) {
                resolutionInfo.error = errorMessage;
            }
            else {
                resolutionInfo.resolved = baseModule ? VersionResolver.unwrapVersion(function makeAbsolute(baseModuleName) {
                    return baseModuleName + (moduleNameWithoutInterceptionData ? DOT + moduleName : moduleName);
                })(baseModule.name) : moduleName;
            }

            return resolutionInfo;
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
        return ((baseModule && !baseModule.isRoot) || moduleName) && !ResolutionHelpers.isRelative(moduleName);
    }

    return ResolutionHelpers;
});
