JARS.internal('GlobalConfigHooks/LoaderContext', function loaderContextHookSetup(getInternal) {
    'use strict';

    var GlobalAccessHook = getInternal('GlobalConfigHooks/GlobalAccess'),
        LoaderContext;

    /**
     * @method
     *
     * @memberof JARS.internals.GlobalConfigHooks
     *
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} loaderContext
     *
     * @return {string}
     */
    LoaderContext = function(globalConfig, loaderContext) {
        if (loaderContext !== globalConfig.get('loaderContext')) {
            globalConfig.update('modules', {
                context: loaderContext
            });
            GlobalAccessHook(globalConfig, globalConfig.get('globalAccess'));
        }

        return loaderContext;
    };

    return LoaderContext;
});
