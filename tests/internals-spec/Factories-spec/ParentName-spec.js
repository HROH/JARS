JARS.module('internals-spec.Factories-spec.ParentName-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector');

    describe('Factories/ParentName', function() {
        var ParentNameFactory = InternalsRegistry.get('Factories/ParentName');

        it('should return the parent module name when given a module injector', function() {
            expect(ParentNameFactory(new Injector('test', 'test-requestor'))).to.equal(Injector.getRootModule().name);
        });

        it('should return the module name when given a bundle injector', function() {
            expect(ParentNameFactory(new Injector('test.*', 'test-requestor'))).to.equal('test');
        });

        it('should return the module name when given an interception injector', function() {
            expect(ParentNameFactory(new Injector('test!', 'test-requestor'))).to.equal('test');
        });
    });
});
