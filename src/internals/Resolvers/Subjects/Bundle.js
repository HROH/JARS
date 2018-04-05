JARS.internal('Resolvers/Subjects/Bundle', function(getInternal) {
    'use strict';

    var unwrapInterception = getInternal('Resolvers/Subjects/Interception').unwrapInterception,
        unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        RE_BUNDLE_SUFFIX = /\.\*$/,
        Bundle;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Bundle = {
        /**
         * @method
         *
         * @param {string} subjectName
         *
         * @return {string}
         */
        getName: unwrapVersion(unwrapInterception(function(subjectName) {
            return !subjectName || RE_BUNDLE_SUFFIX.test(subjectName) ? subjectName : subjectName + BUNDLE_SUFFIX;
        })),
        /**
         * @method
         *
         * @param {string} subjectName
         *
         * @return {string}
         */
        getParentName: unwrapVersion(unwrapInterception(function(subjectName) {
            return subjectName.replace(RE_BUNDLE_SUFFIX, EMPTY_STRING);
        })),
        /**
         * @param {string} subjectName
         *
         * @return {JARS~internals.Resolvers.Subjects~Info}
         */
        getInfo: function(subjectName) {
            return {
                name: Bundle.getParentName(subjectName),

                type: BUNDLE_SUFFIX
            };
        }
    };

    return Bundle;
});
