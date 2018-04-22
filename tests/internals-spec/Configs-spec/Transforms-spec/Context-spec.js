JARS.module('internals-spec.Configs-spec.Transforms-spec.Context-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Context()', function() {
        var ContextTransform = InternalsRegistry.get('Configs/Transforms/Context');

        it('should be a function', function() {
            expect(ContextTransform).to.be.a('function');
        });
    });
});
