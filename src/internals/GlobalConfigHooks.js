JARS.internal('GlobalConfigHooks', function globalConfigHooksSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        GlobalConfigHooks;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    GlobalConfigHooks = {
        debugging: getInternal('DebuggingHook'),

        globalAccess: getInternal('GlobalAccessHook'),

        main: getInternal('MainHook'),

        environments: getInternal('EnvironmentsHook'),

        environment: getInternal('EnvironmentHook'),

        modules: getInternal('ModulesHook'),

        loaderContext: getInternal('LoaderContextHook'),

        interceptors: getInternal('InterceptorsHook')
    };

    return GlobalConfigHooks;
});
