JARS.module('tests.internals.Configs.Transforms.VersionPath').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        PathTransform = InternalsRegistry.get('Configs/Transforms/Path');

    describe('Configs/Transforms/VersionPath()', function() {
        var VersionPathTransform = InternalsRegistry.get('Configs/Transforms/VersionPath');

        it('should point at `Configs/Transforms/Path`', function() {
            expect(VersionPathTransform).to.equal(PathTransform);
        });
    });
});
