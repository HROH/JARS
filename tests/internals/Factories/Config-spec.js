JARS.module('tests.internals.Factories.Config').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Config = InternalsRegistry.get('Configs/Subject'),
        FactoryHelper = this;

    describe('Factories/Config()', function() {
        var ConfigFactory = InternalsRegistry.get('Factories/Config');

        it('should return an instance of `Configs/Subject` when given a module injector', function() {
            expect(ConfigFactory(FactoryHelper.createModuleInjector())).to.be.an.instanceof(Config);
        });

        it('should return an instance of `Configs/Subject` when given a bundle injector', function() {
            expect(ConfigFactory(FactoryHelper.createBundleInjector())).to.be.an.instanceof(Config);
        });

        it('should return an instance of `Configs/Subject` when given an interception injector', function() {
            expect(ConfigFactory(FactoryHelper.createInterceptionInjector())).to.be.an.instanceof(Config);
        });

        it('should get the options from the injector', function() {
            var injector = FactoryHelper.createModuleInjector();

            sinon.spy(injector, 'get');
            ConfigFactory(injector);

            expect(injector.get).to.be.calledWith('options');

            injector.get.restore();
        });
    });
});
