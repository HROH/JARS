JARS.module('tests.internals.Factories.ParentBundle').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector');

    describe('Factories/ParentBundle', function() {
        var ParentBundleFactory = InternalsRegistry.get('Factories/ParentBundle');

        it('should return the parent bundle for a module', function() {
            expect(ParentBundleFactory(new Injector('test', 'test-requestor'))).to.equal(Injector.getSubject('test.*'));
            expect(ParentBundleFactory(new Injector(Injector.getRootModule().name, 'test-requestor'))).to.equal(Injector.getRootBundle());
        });

        it('should return the parent bundle for a bundle', function() {
            expect(ParentBundleFactory(new Injector('test.deep.*', 'test-requestor'))).to.equal(Injector.getSubject('test.*'));
            expect(ParentBundleFactory(new Injector('test.*', 'test-requestor'))).to.equal(Injector.getRootBundle());
        });

        it('should return the parent bundle for an interception', function() {
            expect(ParentBundleFactory(new Injector('test!', 'test-requestor'))).to.equal(Injector.getSubject('test.*'));
            expect(ParentBundleFactory(new Injector('test.*!', 'test-requestor'))).to.equal(Injector.getSubject('test.*'));
        });

        it('should return `null` for the root bundle', function() {
            expect(ParentBundleFactory(new Injector(Injector.getRootBundle().name, 'test-requestor'))).to.equal(null);
        });
    });
});
