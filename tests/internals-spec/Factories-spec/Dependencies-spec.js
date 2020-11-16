JARS.module('internals-spec.Factories-spec.Dependencies-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Dependencies = InternalsRegistry.get('Subjects/Dependencies');

    describe('Factories/Dependencies', function() {
        var DependenciesFactory = InternalsRegistry.get('Factories/Dependencies');

        it('should return an instance of `Subjects/Dependencies` when given a module injector', function() {
            expect(DependenciesFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(Dependencies);
        });

        it('should return an instance of `Subjects/Dependencies` when given a bundle injector', function() {
            expect(DependenciesFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(Dependencies);
        });

        it('should return an instance of `Subjects/Dependencies` when given an interception injector', function() {
            expect(DependenciesFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(Dependencies);
        });
    });
});
