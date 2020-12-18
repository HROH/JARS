JARS.module('tests.internals.Configs.Transforms.Minify').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Minify()', function() {
        var MinifyTransform = InternalsRegistry.get('Configs/Transforms/Minify');

        it('should return a `.min` string when given `true`', function() {
            expect(MinifyTransform(true)).to.equal('.min');
        });

        it('should return an empty string when given `false`', function() {
            expect(MinifyTransform(false)).to.equal('');
        });
    });
});
