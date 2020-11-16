JARS.module('internals-spec.Factories-spec.Options-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Options = InternalsRegistry.get('Configs/Options');

    describe('Factories/Options', function() {
        var OptionsFactory = InternalsRegistry.get('Factories/Options');

        it('should return an instance of `Configs/Options` when given a module injector', function() {
            expect(OptionsFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Options);
        });

        it('should return an instance of `Configs/Options` when given a bundle injector', function() {
            expect(OptionsFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Options);
        });

        it('should return an instance of `Configs/Options` when given an interception injector', function() {
            expect(OptionsFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Options);
        });
    });
});
