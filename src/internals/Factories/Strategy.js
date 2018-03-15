JARS.internal('Factories/Strategy', function(getInternal) {
    'use strict';

    var strategies = {
        module: getInternal('Strategies/Resolution/Subject'),

        bundle: getInternal('Strategies/Resolution/Bundle')
    };

    strategies.interception = strategies.module;

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Strategies.Resolution~Strategy}
     */
    function Strategy(injector) {
        return strategies[injector.type];
    }

    return Strategy;
});
