JARS.module('tests.internals.Configs.Transforms.Scope').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Scope()', function() {
        var ScopeTransform = InternalsRegistry.get('Configs/Transforms/Scope');

        it('should be a function', function() {
            expect(ScopeTransform).to.be.a('function');
        });
    });
});
