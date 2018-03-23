JARS.internal('Resolvers/DirPath', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        removeVersion = getInternal('Resolvers/Version').removeVersion,
        ParentResolver = getInternal('Resolvers/Parent'),
        RE_DOT = /\./g,
        RE_STARTS_WITH_UPPERCASE = /^[A-Z]/,
        SLASH = '/';

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} subjectName
     *
     * @return {string}
     */
    function DirPath(subjectName) {
        return removeVersion(RE_STARTS_WITH_UPPERCASE.test(FileNameResolver(subjectName)) ? getParentDir(subjectName) : subjectName).replace(RE_DOT, SLASH);
    }

    function getParentDir(subjectName) {
        return ParentResolver(subjectName) === ParentResolver.ROOT ? '' : ParentResolver(subjectName);
    }

    return DirPath;
});
