JARS.module('internals-spec.Factories-spec.Description-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector');

    describe('Factories/Description()', function() {
        var DescriptionFactory = InternalsRegistry.get('Factories/Description');

        it('should return a module descriptor for a module', function() {
            expect(DescriptionFactory(new Injector('test', 'test-requestor'))).to.equal('Module:');
        });

        it('should return a bundle descriptor for a bundle', function() {
            expect(DescriptionFactory(new Injector('test.*', 'test-requestor'))).to.equal('Bundle:');
        });

        it('should return a interception descriptor for an interception', function() {
            expect(DescriptionFactory(new Injector('test!', 'test-requestor'))).to.equal('Interception:');
        });
    });
});
