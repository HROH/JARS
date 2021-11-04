JARS.module('tests.internals.Factories.Info').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        getModuleInfo = InternalsRegistry.get('Resolvers/Subjects/Module').getInfo,
        getBundleInfo = InternalsRegistry.get('Resolvers/Subjects/Bundle').getInfo,
        getInterceptionInfo = InternalsRegistry.get('Resolvers/Subjects/Interception').getInfo,
        FactoryHelper = this;

    describe('Factories/Info', function() {
        var InfoFactory = InternalsRegistry.get('Factories/Info');

        it('should get the module info when given a module injector', function() {
            expect(InfoFactory(FactoryHelper.createModuleInjector())).to.deep.equal(getModuleInfo('test'));
        });

        it('should get the bundle info when given a bundle injector', function() {
            expect(InfoFactory(FactoryHelper.createBundleInjector())).to.deep.equal(getBundleInfo('test.*'));
        });

        it('should get the interception info when given an interception injector', function() {
            expect(InfoFactory(FactoryHelper.createInterceptionInjector())).to.deep.equal(getInterceptionInfo('test!'));
        });
    });
});
