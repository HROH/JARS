JARS.module('internals-spec.Factories-spec.Parent-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Subject = InternalsRegistry.get('Subjects/Subject');

    describe('Factories/Parent', function() {
        var ParentFactory = InternalsRegistry.get('Factories/Parent');

        it('should return an instance of `Subjects/Subject` when given a module injector', function() {
            expect(ParentFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given a bundle injector', function() {
            expect(ParentFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Subject);
        });

        it('should return an instance of `Subjects/Subject` when given an interception injector', function() {
            expect(ParentFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Subject);
        });

        it('should return `null` when given the root module injector', function() {
            expect(ParentFactory(new Injector(Injector.getRootModule().name, 'test-requestor'))).to.equal(null);
        });
    });
});
