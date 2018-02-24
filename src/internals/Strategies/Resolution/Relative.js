JARS.internal('Strategies/Resolution/Relative', function(getInternal) {
    'use strict';

    var RelativeResolver = getInternal('Resolvers/Relative'),
        AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute');

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Module} baseModule
     * @param {string} moduleName
     *
     * @return {string}
     */
    function Relative(baseModule, moduleName) {
        return ((!baseModule.isRoot && RelativeResolver(moduleName)) ?
            Relative(baseModule.deps.parent, moduleName.substr(1)) :
            AbsoluteResolutionStrategy(baseModule, moduleName));
    }

    return Relative;
});
