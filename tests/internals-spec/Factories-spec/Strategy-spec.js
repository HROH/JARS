JARS.module('internals-spec.Factories-spec.Strategy-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector'),
        SubjectResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Subject'),
        BundleResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Bundle');

    describe('Factories/Strategy', function() {
        var StrategyFactory = InternalsRegistry.get('Factories/Strategy');

        it('should return `Strategies/Resolution/Subject` when given a module injector', function() {
            expect(StrategyFactory(new Injector('test', 'test-requestor'))).to.equal(SubjectResolutionStrategy);
        });

        it('should return `Strategies/Resolution/Bundle` when given a bundle injector', function() {
            expect(StrategyFactory(new Injector('test.*', 'test-requestor'))).to.equal(BundleResolutionStrategy);
        });

        it('should return `Strategies/Resolution/Subject` when given an interception injector', function() {
            expect(StrategyFactory(new Injector('test!', 'test-requestor'))).to.equal(SubjectResolutionStrategy);
        });
    });
});
