JARS.internal('Helpers/Recoverer', function(getInternal) {
    'use strict';

    var hasOwnProp = getInternal('Helpers/Object').hasOwnProp,
        RECOVER = getInternal('Configs/Options').RECOVER,
        nextSubjects = {};

    /**
     * @memberof JARS~internals.Helpers
     *
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Configs.Hooks~Modules}
     */
    function Recoverer(subject) {
        var subjectForConfig = getSubjectForConfig(subject),
            nextConfig = subject.config.getOwn(RECOVER);

        if(subjectForConfig && !nextConfig) {
            nextConfig = subjectForConfig.config.get(RECOVER);
            nextSubjects[subject.name] = getNextSubjectForConfig(subjectForConfig);
        }

        return nextConfig;
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function getSubjectForConfig(subject) {
        return hasOwnProp(nextSubjects, subject.name) ? nextSubjects[subject.name] : subject;
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function getNextSubjectForConfig(subject) {
        var nextSubject = subject.getParentBundle();

        return nextSubject && nextSubject.config.get(RECOVER) === subject.config.get(RECOVER) ? getNextSubjectForConfig(nextSubject) : nextSubject;
    }

    return Recoverer;
});
