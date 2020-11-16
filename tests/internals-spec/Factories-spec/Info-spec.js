JARS.module('internals-spec.Factories-spec.Info-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        getModuleInfo = InternalsRegistry.get('Resolvers/Subjects/Module').getInfo,
        getBundleInfo = InternalsRegistry.get('Resolvers/Subjects/Bundle').getInfo,
        getInterceptionInfo = InternalsRegistry.get('Resolvers/Subjects/Interception').getInfo;

    describe('Factories/Info', function() {
        var InfoFactory = InternalsRegistry.get('Factories/Info');

        it('should get the module info when given a module injector', function() {
            expect(InfoFactory(new Injector('test', 'test-requestor'))).to.deep.equal(getModuleInfo('test'));
        });

        it('should get the bundle info when given a bundle injector', function() {
            expect(InfoFactory(new Injector('test.*', 'test-requestor'))).to.deep.equal(getBundleInfo('test.*'));
        });

        it('should get the interception info when given an interception injector', function() {
            expect(InfoFactory(new Injector('test!', 'test-requestor'))).to.deep.equal(getInterceptionInfo('test!'));
        });
    });
});
