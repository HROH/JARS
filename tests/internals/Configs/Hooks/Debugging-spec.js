JARS.module('tests.internals.Configs.Hooks.Debugging').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Hooks/Debugging()', function() {
        var DebuggingHook = InternalsRegistry.get('Configs/Hooks/Debugging');

        it('should be a function', function() {
            expect(DebuggingHook).to.be.a('function');
        });
    });
});
