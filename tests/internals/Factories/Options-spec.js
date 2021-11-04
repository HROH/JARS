JARS.module('tests.internals.Factories.Options').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Options = InternalsRegistry.get('Configs/Options'),
        FactoryHelper = this;

    describe('Factories/Options', function() {
        var OptionsFactory = InternalsRegistry.get('Factories/Options');

        it('should return an instance of `Configs/Options` when given a module injector', function() {
            expect(OptionsFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Options);
        });

        it('should return an instance of `Configs/Options` when given a bundle injector', function() {
            expect(OptionsFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Options);
        });

        it('should return an instance of `Configs/Options` when given an interception injector', function() {
            expect(OptionsFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Options);
        });
    });
});
