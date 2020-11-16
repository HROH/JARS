JARS.module('internals-spec.Factories-spec.Requestor-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Subject = InternalsRegistry.get('Subjects/Subject');

    describe('Factories/Requestor', function() {
        var RequestorFactory = InternalsRegistry.get('Factories/Requestor');

        it('should return `null` when given a module injector', function() {
            expect(RequestorFactory(new Injector('test', 'test-requestor'))).to.equal(null);
        });

        it('should return `null` when given a bundle injector', function() {
            expect(RequestorFactory(new Injector('test.*', 'test-requestor'))).to.equal(null);
        });

        it('should return an instance of `Subjects/Subject` when given an interception injector', function() {
            expect(RequestorFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Subject);
        });
    });
});
