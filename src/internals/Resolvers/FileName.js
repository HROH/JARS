JARS.internal('Resolvers/FileName', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('VersionResolver').removeVersion,
        DOT = '.';

    function FileNameResolver(moduleName) {
        moduleName = removeVersion(moduleName);

        return moduleName.substr(moduleName.lastIndexOf(DOT) + 1);
    }

    return FileNameResolver;
});
