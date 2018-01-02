JARS.internal('Strategies/Resolution/Version', function(getInternal) {
    'use strict';

    var VersionResolver = getInternal('Resolvers/Version'),
        MSG_VERSION_RESOLUTION_ERROR = 'a version must only be added to the base module',
        DOT = '.';

    function VersionResolutionStrategy(baseModule, moduleName) {
        return VersionResolver.getVersion(moduleName) ? {
            error: MSG_VERSION_RESOLUTION_ERROR
        } : {
            moduleName: VersionResolver.unwrapVersion(function resolveAbsolute(baseModuleName) {
                return baseModuleName + (moduleName ? DOT + moduleName : moduleName);
            })(baseModule.name)
        };
    }

    return VersionResolutionStrategy;
});
