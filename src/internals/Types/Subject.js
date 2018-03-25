JARS.internal('Types/Subject', function(getInternal) {
    'use strict';

    var removeBundleSuffix = getInternal('Resolvers/Bundle').removeBundleSuffix,
        getSubjectName = getInternal('Resolvers/Interception').getSubjectName,
        SUBJECT_TYPE_MODULE = 'module',
        SUBJECT_TYPE_BUNDLE = 'bundle',
        SUBJECT_TYPE_INTERCEPTION = 'interception',
        Subject;

    Subject = {
        get: function(subjectName) {
            return Subject.isInterception(subjectName) ? SUBJECT_TYPE_INTERCEPTION : Subject.isBundle(subjectName) ? SUBJECT_TYPE_BUNDLE : SUBJECT_TYPE_MODULE;
        },

        isBundle: function(subjectName) {
            return removeBundleSuffix(subjectName) !== subjectName;
        },

        isInterception: function(subjectName) {
            return getSubjectName(subjectName) !== subjectName;
        }
    };

    return Subject;
});
