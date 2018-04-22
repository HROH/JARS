JARS.module('internals-spec.Configs-spec.Hooks-spec.Debugging-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Hooks/Debugging()', function() {
        var DebuggingHook = InternalsRegistry.get('Configs/Hooks/Debugging');

        it('should be a function', function() {
            expect(DebuggingHook).to.be.a('function');
        });
    });
});
