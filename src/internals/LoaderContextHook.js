JARS.internal('LoaderContextHook', function(InternalsManager) {
    'use strict';

    var GlobalAccessHook = InternalsManager.get('GlobalAccessHook'),
        LoaderContextHook;

    /**
     * @param {JARS.internals.GlobalConfig} globalConfig
     * @param {string} loaderContext
     *
     * @return {string}
     */
    LoaderContextHook = function(globalConfig, loaderContext) {
        if (loaderContext !== globalConfig.get('loaderContext')) {
            GlobalAccessHook(globalConfig, globalConfig.get('globalAccess'));
        }

        return loaderContext;
    };

    return LoaderContextHook;
});
