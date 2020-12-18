JARS.module('tests.internals.Configs.Transforms.CheckCircularDeps').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/CheckCircularDeps()', function() {
        var CheckCircularDepsTransform = InternalsRegistry.get('Configs/Transforms/CheckCircularDeps');

        it('should convert a truthy value to true', function() {
            expect(CheckCircularDepsTransform(true)).to.be.true;
            expect(CheckCircularDepsTransform('0')).to.be.true;
            expect(CheckCircularDepsTransform(1)).to.be.true;
            expect(CheckCircularDepsTransform({})).to.be.true;
        });

        it('should convert a falsy value to false', function() {
            expect(CheckCircularDepsTransform(false)).to.be.false;
            expect(CheckCircularDepsTransform('')).to.be.false;
            expect(CheckCircularDepsTransform(0)).to.be.false;
            expect(CheckCircularDepsTransform()).to.be.false;
            expect(CheckCircularDepsTransform(null)).to.be.false;
        });
    });
});
