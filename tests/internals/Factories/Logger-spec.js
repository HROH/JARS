JARS.module('tests.internals.Factories.Logger').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Logger = InternalsRegistry.get('Logger/Logger'),
        FactoryHelper = this;

    describe('Factories/Logger', function() {
        var LoggerFactory = InternalsRegistry.get('Factories/Logger');

        it('should return an instance of `Logger/Logger` when given a module injector', function() {
            expect(LoggerFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Logger);
        });

        it('should return an instance of `Logger/Logger` when given a bundle injector', function() {
            expect(LoggerFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Logger);
        });

        it('should return an instance of `Logger/Logger` when given an interception injector', function() {
            expect(LoggerFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Logger);
        });
    });
});
