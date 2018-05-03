JARS.internal('Types/Subject', function(getInternal) {
    'use strict';

    var getBundleParentName = getInternal('Resolvers/Subjects/Bundle').getParentName,
        getInterceptionParentName = getInternal('Resolvers/Subjects/Interception').getParentName,
        SUBJECT_TYPE_MODULE = 'module',
        SUBJECT_TYPE_BUNDLE = 'bundle',
        SUBJECT_TYPE_INTERCEPTION = 'interception',
        Subject;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Types
     */
    Subject = {
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        get: function(subjectName) {
            return Subject.isInterception(subjectName) ? SUBJECT_TYPE_INTERCEPTION : Subject.isBundle(subjectName) ? SUBJECT_TYPE_BUNDLE : SUBJECT_TYPE_MODULE;
        },
        /**
         * @param {string} subjectName
         *
         * @return {boolean}
         */
        isModule: function(subjectName) {
            return Subject.get(subjectName) === SUBJECT_TYPE_MODULE;
        },
        /**
         * @param {string} subjectName
         *
         * @return {boolean}
         */
        isBundle: function(subjectName) {
            return !Subject.isInterception(subjectName) && getBundleParentName(subjectName) !== subjectName;
        },
        /**
         * @param {string} subjectName
         *
         * @return {boolean}
         */
        isInterception: function(subjectName) {
            return getInterceptionParentName(subjectName) !== subjectName;
        }
    };

    return Subject;
});
