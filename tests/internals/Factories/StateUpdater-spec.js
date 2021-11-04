JARS.module('tests.internals.Factories.StateUpdater').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        StateUpdater = InternalsRegistry.get('State/Updater'),
        FactoryHelper = this;

    describe('Factories/StateUpdater', function() {
        var StateUpdaterFactory = InternalsRegistry.get('Factories/StateUpdater');

        it('should return an instance of `State/Updater` when given a module injector', function() {
            expect(StateUpdaterFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(StateUpdater);
        });

        it('should return an instance of `State/Updater` when given a bundle injector', function() {
            expect(StateUpdaterFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(StateUpdater);
        });

        it('should return an instance of `State/Updater` when given an interception injector', function() {
            expect(StateUpdaterFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(StateUpdater);
        });
    });
});
