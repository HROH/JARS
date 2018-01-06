JARS.internal('Strategies/Type/Any', function(getInternal) {
    'use strict';

    var getType = getInternal('System').getType;

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Module} baseModule
     * @param {(JARS~internals.Dependencies~Declaration|JARS~internals.Bundle~Declaration)} modules
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function Any(baseModule, modules, resolutionStrategy) {
        return getInternal('Strategies/Type')[getType(modules)](baseModule, modules, resolutionStrategy);
    }

    return Any;
});
