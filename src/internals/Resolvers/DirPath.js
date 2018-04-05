JARS.internal('Resolvers/DirPath', function(getInternal) {
    'use strict';

    var removeVersion = getInternal('Resolvers/Version').removeVersion,
        ModuleResolver = getInternal('Resolvers/Subjects/Module'),
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
        var info = ModuleResolver.getInfo(subjectName);

        return removeVersion(RE_STARTS_WITH_UPPERCASE.test(info.data) ? ModuleResolver.isRoot(info.name) ? '' : info.name : subjectName).replace(RE_DOT, SLASH);
    }

    return DirPath;
});
