JARS.internal('Resolvers/DirPath', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('Resolvers/Version').removeVersion,
        getParentName = getInternal('Resolvers/Dependencies').getParentName,
        RE_DOT = /\./g,
        RE_STARTS_WITH_LOWERCASE = /^[a-z]/,
        SLASH = '/';

    function DirPathResolver(moduleName, fileName) {
        return removeVersion(RE_STARTS_WITH_LOWERCASE.test(fileName) ? moduleName : getParentName(moduleName)).replace(RE_DOT, SLASH);
    }

    return DirPathResolver;
});
