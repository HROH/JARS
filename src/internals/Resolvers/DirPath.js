JARS.internal('Resolvers/DirPath', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('VersionResolver').removeVersion,
        getParentName = getInternal('DependenciesResolver').getParentName,
        RE_DOT = /\./g,
        RE_STARTS_WITH_LOWERCASE = /^[a-z]/,
        SLASH = '/';

    function DirPathResolver(moduleName, fileName) {
        return removeVersion(RE_STARTS_WITH_LOWERCASE.test(fileName) ? moduleName : getParentName(moduleName)).replace(RE_DOT, SLASH);
    }

    return DirPathResolver;
});
