JARS.internal('Resolvers/ConfigOptions', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        DirPathResolver = getInternal('Resolvers/DirPath'),
        getVersion = getInternal('Resolvers/Version').getVersion,
        DEFAULT_EXTENSION = 'js';

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} moduleName
     *
     * @return {JARS~internals.GlobalConfig~Options.Modules}
     */
    function ConfigOptions(moduleName) {
        return {
            extension: DEFAULT_EXTENSION,

            fileName: FileNameResolver(moduleName),

            dirPath: DirPathResolver(moduleName),

            versionPath: getVersion(moduleName)
        };
    }

    return ConfigOptions;
});
