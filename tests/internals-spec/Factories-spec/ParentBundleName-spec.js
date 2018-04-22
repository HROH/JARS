JARS.module('internals-spec.Factories-spec.ParentBundleName-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector'),
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects');

    describe('Factories/ParentBundleName', function() {
        var ParentBundleNameFactory = InternalsRegistry.get('Factories/ParentBundleName');

        it('should return the bundle when given a module injector', function() {
            expect(ParentBundleNameFactory(new Injector('test', 'test-requestor'))).to.equal('test.*');
        });

        it('should return the bundle when given a bundle injector', function() {
            expect(ParentBundleNameFactory(new Injector('test.*', 'test-requestor'))).to.equal(SubjectsRegistry.getRootBundle().name);
        });

        it('should return the bundle when given an interception injector', function() {
            expect(ParentBundleNameFactory(new Injector('test!', 'test-requestor'))).to.equal('test.*');
        });

        it('should return an empty string when given the root bundle injector', function() {
            expect(ParentBundleNameFactory(new Injector(SubjectsRegistry.getRootBundle().name, 'test-requestor'))).to.equal('');
        });
    });
});
