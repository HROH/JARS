JARS.internal('Resolvers/Parent', function(getInternal) {
    'use strict';

    var unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        DOT = '.',
        ROOT = '*',
        getParentName;

    /**
     * @method
     *
     * @param {string} subjectName
     *
     * @return {string}
     */
    function Parent(subjectName) {
        return subjectName !== ROOT ? getParentName(subjectName) || ROOT : '';
    }

    getParentName = unwrapVersion(function(subjectName) {
        return subjectName.lastIndexOf(DOT) > -1 && subjectName.substr(0, subjectName.lastIndexOf(DOT));
    });

    Parent.ROOT = ROOT;

    return Parent;
});
