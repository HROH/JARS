JARS.internal('ResolutionStrategies/Absolute', function absoluteResolutionStrategySetup(getInternal) {
    'use strict';

    var VersionResolver = getInternal('VersionResolver'),
        InterceptionResolver = getInternal('InterceptionResolver'),
        isRelative = getInternal('ResolutionHelpers').isRelative,
        MSG_VERSION_RESOLUTION_ERROR = 'a version must not be added when the parent is already versioned',
        DOT = '.';

    /**
     * @method Absolute
     *
     * @memberof JARS.internals.ResolutionStrategies
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function AbsoluteResolutionStrategy(baseModule, moduleName) {
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
    }

    /**
     * @memberof JARS.internals.ResolutionStrategies.Absolute
     * @inner
     *
     * @param {JARS.internals.Module} baseModule
     * @param {string} moduleName
     *
     * @return {boolean}
     */
    function canMakeAbsolute(baseModule, moduleName) {
        return (baseModule ? !baseModule.isRoot : moduleName) && !isRelative(moduleName);
    }

    return AbsoluteResolutionStrategy;
});
