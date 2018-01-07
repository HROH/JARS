JARS.internal('Configs/Hooks/LoaderContext', function(getInternal) {
    'use strict';

    var GlobalAccessHook = getInternal('Configs/Hooks/GlobalAccess');

    /**
     * @method
     *
     * @memberof JARS~internals.Configs.Hooks
     *
     * @param {JARS~internals.Configs.Global} globalConfig
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
