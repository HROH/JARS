JARS.internal('GlobalConfigHooks/LoaderContext', function loaderContextHookSetup(getInternal) {
    'use strict';

    var GlobalAccessHook = getInternal('GlobalConfigHooks/GlobalAccess'),
        LoaderContext;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} loaderContext
     *
     * @return {string}
     */
    LoaderContext = function(globalConfig, loaderContext) {
        if (loaderContext !== globalConfig.get('loaderContext')) {
            GlobalAccessHook(globalConfig, globalConfig.get('globalAccess'));
        }

        return loaderContext;
    };

    return LoaderContext;
});
