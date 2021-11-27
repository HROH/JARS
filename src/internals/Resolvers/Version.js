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
         * @param {function(string): string} transformSubjectName
         *
         * @return {function(string): string}
         */
        unwrapVersion: function(transformSubjectName) {
            return function(subjectName) {
                return Version.appendVersion(transformSubjectName(Version.removeVersion(subjectName)), Version.getVersion(subjectName));
            };
        },
        /**
         * @param {string} subjectName
         * @param {string} version
         *
         * @return {string}
         */
        appendVersion: function(subjectName, version) {
            return subjectName && version ? [subjectName, version].join(VERSION_DELIMITER) : subjectName;
        },
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        removeVersion: function(subjectName) {
            return subjectName.split(VERSION_DELIMITER)[0];
        },
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        getVersion: function(subjectName) {
            return subjectName.split(VERSION_DELIMITER)[1] || EMPTY_STRING;
        }
    };

    return Version;
});
