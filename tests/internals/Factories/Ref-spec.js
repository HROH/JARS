JARS.module('tests.internals.Factories.Ref').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Ref = InternalsRegistry.get('Refs/Subject'),
        FactoryHelper = this;

    describe('Factories/Ref', function() {
        var RefFactory = InternalsRegistry.get('Factories/Ref');

        it('should return an instance of `Refs/Subject` when given a module injector', function() {
            expect(RefFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Ref);
        });

        it('should return an instance of `Refs/Subject` when given a bundle injector', function() {
            expect(RefFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Ref);
        });

        it('should return an instance of `Refs/Subject` when given an interception injector', function() {
            expect(RefFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Ref);
        });
    });
});
