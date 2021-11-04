JARS.module('tests.internals.Factories.State').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        State = InternalsRegistry.get('State/Subject'),
        FactoryHelper = this;

    describe('Factories/State', function() {
        var StateFactory = InternalsRegistry.get('Factories/State');

        it('should return an instance of `State/Subject` when given a module injector', function() {
            expect(StateFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(State);
        });

        it('should return an instance of `State/Subject` when given a bundle injector', function() {
            expect(StateFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(State);
        });

        it('should return an instance of `State/Subject` when given an interception injector', function() {
            expect(StateFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(State);
        });
    });
});
