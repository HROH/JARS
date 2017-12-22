JARS.internal('ResolutionStrategies/Absolute', function absoluteResolutionStrategySetup(getInternal) {
    'use strict';

    var VersionResolver = getInternal('Resolvers/Version'),
        isRelative = getInternal('Resolvers/Relative').isRelative,
        MSG_VERSION_RESOLUTION_ERROR = 'a version must only be added to the base module',
        MSG_ABSOLUTE_RESOLUTION_ERROR = 'a module can not be resolved beyond the root',
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
        return VersionResolver.getVersion(moduleName) ? {
            error: MSG_VERSION_RESOLUTION_ERROR
        } : (baseModule.isRoot || isRelative(moduleName)) ? {
            error: MSG_ABSOLUTE_RESOLUTION_ERROR
        } : {
            moduleName: VersionResolver.unwrapVersion(function resolveAbsolute(baseModuleName) {
                return baseModuleName + (moduleName ? DOT + moduleName : moduleName);
            })(baseModule.name)
        };
    }

    return AbsoluteResolutionStrategy;
});
