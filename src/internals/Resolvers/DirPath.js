JARS.internal('Resolvers/DirPath', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        removeVersion = getInternal('Resolvers/Version').removeVersion,
        getParentName = getInternal('Resolvers/Dependencies').getParentName,
        RE_DOT = /\./g,
        RE_STARTS_WITH_LOWERCASE = /^[a-z]/,
        SLASH = '/';

    function DirPathResolver(moduleName) {
        return removeVersion(RE_STARTS_WITH_LOWERCASE.test(FileNameResolver(moduleName)) ? moduleName : getParentName(moduleName)).replace(RE_DOT, SLASH);
    }

    return DirPathResolver;
});
