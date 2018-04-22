JARS.module('internals-spec.Factories-spec.Config-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector'),
        Config = InternalsRegistry.get('Configs/Subject');

    describe('Factories/Config()', function() {
        var ConfigFactory = InternalsRegistry.get('Factories/Config');

        it('should return an instance of `Configs/Subject` when given a module injector', function() {
            expect(ConfigFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Config);
        });

        it('should return an instance of `Configs/Subject` when given a bundle injector', function() {
            expect(ConfigFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Config);
        });

        it('should return an instance of `Configs/Subject` when given an interception injector', function() {
            expect(ConfigFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Config);
        });

        it('should get the options from the injector', function() {
            var injector = new Injector('test', 'test-requestor');

            sinon.spy(injector, 'get');
            ConfigFactory(injector);

            expect(injector.get).to.be.calledWith('options');

            injector.get.restore();
        });
    });
});
