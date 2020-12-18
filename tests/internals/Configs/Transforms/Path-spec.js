JARS.module('tests.internals.Configs.Transforms.Path').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Path()', function() {
        var PathTransform = InternalsRegistry.get('Configs/Transforms/Path');

        it('should append a `/` at the end of a given path', function() {
            expect(PathTransform('test')).to.equal('test/');
        });

        it('should not append a `/` at the end of a given path when it is already append', function() {
            expect(PathTransform('test/')).to.equal('test/');
        });
    });
});
