JARS.module('internals-spec.Configs-spec.Transforms-spec.Timeout-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Timeout()', function() {
        var TimeoutTransform = InternalsRegistry.get('Configs/Transforms/Timeout');

        it('should return the timeout number when the given number is bigger than 0.5', function() {
            expect(TimeoutTransform(0.6)).to.equal(0.6);
        });

        it('should return 0.5 when the given number is smaller than 0.5', function() {
            expect(TimeoutTransform(0.3)).to.equal(0.5);
        });
    });
});
