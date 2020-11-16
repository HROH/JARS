JARS.module('internals-spec.Strategies-spec.Resolution-spec.Absolute-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector');

    describe('Strategies/Resolution/Absolute()', function() {
        var AbsoluteResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Absolute');

        describe('given a base module', function() {
            var testModule = Injector.getSubject('test');

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
