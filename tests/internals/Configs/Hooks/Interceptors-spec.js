JARS.module('tests.internals.Configs.Hooks.Interceptors').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Hooks/Interceptors()', function() {
        var InterceptorsHook = InternalsRegistry.get('Configs/Hooks/Interceptors');

        it('should be a function', function() {
            expect(InterceptorsHook).to.be.a('function');
        });
    });
});
