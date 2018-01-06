JARS.internal('Resolvers/FileName', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('Resolvers/Version').removeVersion,
        DOT = '.';

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {string} moduleName
     *
     * @return {string}
     */
    function FileName(moduleName) {
        moduleName = removeVersion(moduleName);

        return moduleName.substr(moduleName.lastIndexOf(DOT) + 1);
    }

    return FileName;
});
