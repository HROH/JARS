JARS.internal('ConfigTransforms', function configTransformsSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        PathTransform = getInternal('transforms/Path'),
        IdentityTransform = getInternal('transforms/Identity'),
        ConfigTransforms;

    /**
     * @memberof JARS.internals
     */
    ConfigTransforms = {
        basePath: PathTransform,

        dirPath: PathTransform,

        versionDir: PathTransform,

        cache: IdentityTransform,

        checkCircularDeps: IdentityTransform,

        fileName: getInternal('transforms/File'),

        config: getInternal('transforms/ModuleConfig'),

        extension: getInternal('transforms/Extension'),

        minified: getInternal('transforms/Minify'),

        recover: getInternal('transforms/Recover'),

        timeout: getInternal('transforms/Timeout')
    };

    return ConfigTransforms;
});
