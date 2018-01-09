JARS.internal('Strategies/Resolution/Version', function(getInternal) {
    'use strict';

    var VersionResolver = getInternal('Resolvers/Version'),
        MSG_VERSION_RESOLUTION_ERROR = 'a version must only be added to the base module',
        DOT = '.';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function Version(baseModule, moduleName) {
        return VersionResolver.getVersion(moduleName) ? {
            error: MSG_VERSION_RESOLUTION_ERROR
        } : {
            moduleName: VersionResolver.unwrapVersion(function resolveAbsolute(baseModuleName) {
                return baseModuleName + (moduleName ? DOT + moduleName : moduleName);
            })(baseModule.name)
        };
    }

    return Version;
});
