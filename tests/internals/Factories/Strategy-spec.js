JARS.module('tests.internals.Factories.Strategy').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Subject'),
        BundleResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Bundle'),
        FactoryHelper = this;

    describe('Factories/Strategy', function() {
        var StrategyFactory = InternalsRegistry.get('Factories/Strategy');

        it('should return `Strategies/Resolution/Subject` when given a module injector', function() {
            expect(StrategyFactory(FactoryHelper.createModuleInjector())).to.equal(SubjectResolutionStrategy);
        });

        it('should return `Strategies/Resolution/Bundle` when given a bundle injector', function() {
            expect(StrategyFactory(FactoryHelper.createBundleInjector())).to.equal(BundleResolutionStrategy);
        });

        it('should return `Strategies/Resolution/Subject` when given an interception injector', function() {
            expect(StrategyFactory(FactoryHelper.createInterceptionInjector())).to.equal(SubjectResolutionStrategy);
        });
    });
});
