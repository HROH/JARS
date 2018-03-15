JARS.internal('Resolvers/Options', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        DirPathResolver = getInternal('Resolvers/DirPath'),
        getVersion = getInternal('Resolvers/Version').getVersion,
        DEFAULT_EXTENSION = 'js';

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} subjectname
     *
     * @return {JARS~internals.Configs.Hooks~Modules}
     */
    function Options(subjectname) {
        return {
            extension: DEFAULT_EXTENSION,

            fileName: FileNameResolver(subjectname),

            dirPath: DirPathResolver(subjectname),

            versionPath: getVersion(subjectname)
        };
    }

    return Options;
});
