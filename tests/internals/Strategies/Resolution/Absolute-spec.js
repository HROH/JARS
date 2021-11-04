JARS.module('tests.internals.Strategies.Resolution.Absolute').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects');

    describe('Strategies/Resolution/Absolute()', function() {
        var AbsoluteResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Absolute');

        describe('given a base module', function() {
            var testModule = SubjectsRegistry.getSubject('test');

            it('should resolve a modulename absolute', function() {
                expect(AbsoluteResolutionStrategy(testModule, 'Module')).to.deep.equal({
                    name: 'test.Module'
                });
            });

            it('should fail to resolve a relative modulename absolute', function() {
                expect(AbsoluteResolutionStrategy(testModule, '.Module')).to.deep.equal({
                    error: 'a module can not be resolved beyond the root'
                });
            });
        });
    });
});
