JARS.internal('ConfigTransforms', function configTransformsSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        PathTransform = getInternal('PathTransform'),
        IdentityTransform = getInternal('IdentityTransform'),
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

        fileName: getInternal('FileTransform'),

        config: getInternal('ModuleConfigTransform'),

        extension: getInternal('ExtensionTransform'),

        minified: getInternal('MinifyTransform'),

        recover: getInternal('RecoverTransform'),

        timeout: getInternal('TimeoutTransform')
    };

    return ConfigTransforms;
});
