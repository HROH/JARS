JARS.internal('Resolvers/Subjects/Module', function(getInternal) {
    'use strict';

    var unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        unwrapInterception = getInternal('Resolvers/Subjects/Interception').unwrapInterception,
        anonymousCounter = 0,
        ANONYMOUS_NAME = 'anonymous_',
        DOT = '.',
        EMPTY_STRING = '',
        Module;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Module = {
        ROOT: '*',
        /**
         * @param {string} subjectName
         *
         * @return {boolean}
         */
        isRoot: function(subjectName) {
            return subjectName === Module.ROOT;
        },
        /**
         * @returns {string}
         */
        getAnonymousName: function() {
            return ANONYMOUS_NAME + anonymousCounter++;
        },
        /**
         * @param {string} subjectName
         * @param {string} childSubjectName
         *
         * @return {string}
         */
        getName: function(subjectName, childSubjectName) {
            return Module.isRoot(subjectName) ? childSubjectName : unwrapVersion(function(tmpSubjectName) {
                return unwrapInterception(function(tmpChildSubjectName) {
                    return tmpSubjectName + (tmpChildSubjectName ? DOT + tmpChildSubjectName : EMPTY_STRING);
                })(childSubjectName);
            })(subjectName);
        },
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        getParentName: function(subjectName) {
            return Module.isRoot(subjectName) ? EMPTY_STRING : unwrapVersion(function(tmpSubjectName) {
                return tmpSubjectName.lastIndexOf(DOT) > -1 && tmpSubjectName.substr(0, tmpSubjectName.lastIndexOf(DOT));
            })(subjectName) || Module.ROOT;
        },
        /**
         * @param {string} subjectName
         *
         * @return {JARS~internals.Resolvers.Subjects~Info}
         */
        getInfo: function(subjectName) {
            return {
                name: Module.getParentName(subjectName),

                type: DOT,

                data: unwrapVersion(function(tmpSubjectName) {
                    return tmpSubjectName.substr(tmpSubjectName.lastIndexOf(DOT) + 1);
                })(subjectName)
            };
        }
    };

    return Module;
});
