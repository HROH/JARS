JARS.module('tests.internals.Factories.Ref').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Ref = InternalsRegistry.get('Refs/Subject');

    describe('Factories/Ref', function() {
        var RefFactory = InternalsRegistry.get('Factories/Ref');

        it('should return an instance of `Refs/Subject` when given a module injector', function() {
            expect(RefFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Ref);
        });

        it('should return an instance of `Refs/Subject` when given a bundle injector', function() {
            expect(RefFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Ref);
        });

        it('should return an instance of `Refs/Subject` when given an interception injector', function() {
            expect(RefFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Ref);
        });
    });
});
