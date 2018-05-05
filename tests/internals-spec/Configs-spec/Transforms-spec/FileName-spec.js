JARS.module('internals-spec.Configs-spec.Transforms-spec.FileName-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/FileName()', function() {
        var FileNameTransform = InternalsRegistry.get('Configs/Transforms/FileName');

        it('should return the given filename', function() {
            expect(FileNameTransform('file')).to.equal('file');
        });
    });
});