JARS.module('internals-spec.Factories-spec.Subject-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector'),
        Subject = InternalsRegistry.get('Subjects/Subject');

    describe('Factories/Subject', function() {
        var SubjectFactory = InternalsRegistry.get('Factories/Subject');

        it('should return an instance of `Subjects/Subject` when given a module injector', function() {
            expect(SubjectFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given a bundle injector', function() {
            expect(SubjectFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given an interception injector', function() {
            expect(SubjectFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Subject);
        });
    });
});
