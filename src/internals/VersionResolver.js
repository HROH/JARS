JARS.internal('VersionResolver', function() {
    'use strict';

    var EMPTY_STRING = '',
        VERSION_DELIMITER = '@',
        VersionResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    VersionResolver = {
        /**
         * @param {function(string): string} transformModuleName
         *
         * @return {function(string): string}
         */
        unwrapVersion: function(transformModuleName) {
            return function unwrapVersion(moduleName) {
                return appendVersion(transformModuleName(VersionResolver.removeVersion(moduleName)), VersionResolver.getVersion(moduleName));
            };
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        removeVersion: function(moduleName) {
            return moduleName.split(VERSION_DELIMITER)[0];
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getVersion: function(moduleName) {
            return moduleName.split(VERSION_DELIMITER)[1] || EMPTY_STRING;
        }
    };

    /**
     * @memberof JARS.internals.VersionResolver
     * @inner
     *
     * @param {string} moduleName
     * @param {string} version
     *
     * @return {string}
     */
    function appendVersion(moduleName, version) {
        return (moduleName && version) ? [moduleName, version].join(VERSION_DELIMITER) : moduleName;
    }

    return VersionResolver;
});
