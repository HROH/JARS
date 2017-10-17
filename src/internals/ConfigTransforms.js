JARS.internal('ConfigTransforms', function configTransformsSetup(InternalsManager) {
    'use strict';

    var getInternal = InternalsManager.get,
        PathTransform = getInternal('PathTransform'),
        IdentityTransform = getInternal('IdentityTransform'),
        FileTransform = getInternal('FileTransform'),
        ModuleConfigTransform = getInternal('ModuleConfigTransform'),
        ExtensionTransform = getInternal('ExtensionTransform'),
        MinifyTransform = getInternal('MinifyTransform'),
        RecoverTransform = getInternal('RecoverTransform'),
        TimeoutTransform = getInternal('TimeoutTransform'),
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

        fileName: FileTransform,

        config: ModuleConfigTransform,

        extension: ExtensionTransform,

        minified: MinifyTransform,

        recover: RecoverTransform,

        timeout: TimeoutTransform
    };

    return ConfigTransforms;
});
