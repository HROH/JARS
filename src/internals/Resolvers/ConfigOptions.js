JARS.internal('Resolvers/ConfigOptions', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        DirPathResolver = getInternal('Resolvers/DirPath'),
        getVersion = getInternal('Resolvers/Version').getVersion,
        DEFAULT_EXTENSION = 'js';

    function ConfigOptionsResolver(moduleName) {
        return {
            extension: DEFAULT_EXTENSION,

            fileName: FileNameResolver(moduleName),

            dirPath: DirPathResolver(moduleName),

            versionPath: getVersion(moduleName)
        };
    }

    return ConfigOptionsResolver;
});
