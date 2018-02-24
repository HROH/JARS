JARS.internal('Resolvers/Version', function() {
    'use strict';

    var EMPTY_STRING = '',
        VERSION_DELIMITER = '@',
        Version;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Version = {
        /**
         * @param {function(string): string} transformModuleName
         *
         * @return {function(string): string}
         */
        unwrapVersion: function(transformModuleName) {
            return function unwrapVersion(moduleName) {
                return appendVersion(transformModuleName(Version.removeVersion(moduleName)), Version.getVersion(moduleName));
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
     * @memberof JARS~internals.Resolvers.Version
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

    return Version;
});
