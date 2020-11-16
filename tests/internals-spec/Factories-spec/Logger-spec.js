JARS.module('internals-spec.Factories-spec.Logger-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Logger = InternalsRegistry.get('Logger/Logger');

    describe('Factories/Logger', function() {
        var LoggerFactory = InternalsRegistry.get('Factories/Logger');

        it('should return an instance of `Logger/Logger` when given a module injector', function() {
            expect(LoggerFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Logger);
        });

        it('should return an instance of `Logger/Logger` when given a bundle injector', function() {
            expect(LoggerFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Logger);
        });

        it('should return an instance of `Logger/Logger` when given an interception injector', function() {
            expect(LoggerFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Logger);
        });
    });
});
