JARS.internal('GlobalConfigHooks/LoaderContext', function(getInternal) {
    'use strict';

    var GlobalAccessHook = getInternal('GlobalConfigHooks/GlobalAccess');

    /**
     * @method
     *
     * @memberof JARS~internals.GlobalConfig.Hooks
     *
     * @param {JARS~internals.GlobalConfig} globalConfig
     * @param {string} loaderContext
     *
     * @return {string}
     */
    function LoaderContext(globalConfig, loaderContext) {
        if (loaderContext !== globalConfig.get('loaderContext')) {
            globalConfig.update('modules', {
                context: loaderContext
            });
            GlobalAccessHook(globalConfig, globalConfig.get('globalAccess'));
        }

        return loaderContext;
    }

    return LoaderContext;
});
