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
     * @param {string} moduleName
     *
     * @return {string}
     */
    function DirPath(moduleName) {
        return removeVersion(RE_STARTS_WITH_UPPERCASE.test(FileNameResolver(moduleName)) ? ParentResolver(moduleName) : moduleName).replace(RE_DOT, SLASH);
    }

    return DirPath;
});
