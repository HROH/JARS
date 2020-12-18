JARS.module('tests.internals.Configs.Hooks.Environments').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Hooks/Environments()', function() {
        var EnvironmentsHook = InternalsRegistry.get('Configs/Hooks/Environments');

        it('should be a function', function() {
            expect(EnvironmentsHook).to.be.a('function');
        });
    });
});
