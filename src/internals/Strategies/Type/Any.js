JARS.internal('Strategies/Type/Any', function(getInternal) {
    'use strict';

    var getType = getInternal('Types/Lookup').get;

    /**
     * @memberof JARS~internals.Strategies.Type
     *
     * @param {JARS~internals.Subjects.Module} baseModule
     * @param {JARS~internals.Subjects~Declaration} modules
     * @param {JARS~internals.Strategies.Resolution~Strategy} resolutionStrategy
     *
     * @return {string[]}
     */
    function Any(baseModule, modules, resolutionStrategy) {
        return getInternal('Strategies/Type')[getType(modules)](baseModule, modules, resolutionStrategy);
    }

    return Any;
});
