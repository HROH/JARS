JARS.internal('Resolvers/Parent', function(getInternal) {
    'use strict';

    var unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        DOT = '.',
        ROOT = '*',
        getParentName;

    /**
     * @method
     *
     * @param {string} moduleName
     *
     * @return {string}
     */
    function Parent(moduleName) {
        return getParentName(moduleName) || ROOT;
    }
    
    getParentName = unwrapVersion(function(moduleName) {
        return moduleName.lastIndexOf(DOT) > -1 && moduleName.substr(0, moduleName.lastIndexOf(DOT));
    });

    Parent.ROOT = ROOT;

    return Parent;
});
