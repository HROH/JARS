JARS.module('internals-spec.Configs-spec.Transforms-spec.Debug-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Debug()', function() {
        var DebugTransform = InternalsRegistry.get('Configs/Transforms/Debug');

        it('should convert a truthy value to true', function() {
            expect(DebugTransform(true)).to.be.true;
            expect(DebugTransform('0')).to.be.true;
            expect(DebugTransform(1)).to.be.true;
            expect(DebugTransform({})).to.be.true;
        });

        it('should convert a falsy value to false', function() {
            expect(DebugTransform(false)).to.be.false;
            expect(DebugTransform('')).to.be.false;
            expect(DebugTransform(0)).to.be.false;
            expect(DebugTransform()).to.be.false;
            expect(DebugTransform(null)).to.be.false;
        });
    });
});
