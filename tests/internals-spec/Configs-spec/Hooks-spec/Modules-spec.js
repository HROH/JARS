JARS.module('internals-spec.Configs-spec.Hooks-spec.Modules-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Hooks/Modules()', function() {
        var ModulesHook = InternalsRegistry.get('Configs/Hooks/Modules');

        it('should be a function', function() {
            expect(ModulesHook).to.be.a('function');
        });
    });
});
