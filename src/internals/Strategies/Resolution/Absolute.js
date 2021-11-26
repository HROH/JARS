JARS.internal('Strategies/Resolution/Absolute', function(getInternal) {
    'use strict';

    var isRelative = getInternal('Resolvers/Relative').is,
        getVersion = getInternal('Resolvers/Version').getVersion,
        ModuleResolver = getInternal('Resolvers/Subjects/Module'),
        MSG_VERSION_RESOLUTION_ERROR = 'a version must only be added to the base module',
        MSG_ABSOLUTE_RESOLUTION_ERROR = 'a module can not be resolved beyond the root';

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {JARS~internals.Strategies.Resolution~Data}
     */
    function Absolute(subject, subjectName) {
        return ModuleResolver.isRoot(subject.name) || isRelative(subjectName) ? {
            error: MSG_ABSOLUTE_RESOLUTION_ERROR
        } : getVersion(subjectName) ? {
            error: MSG_VERSION_RESOLUTION_ERROR
        } : {
            name: ModuleResolver.getName(subject.name, subjectName)
        };
    }

    return Absolute;
});
