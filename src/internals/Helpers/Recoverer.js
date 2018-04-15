JARS.internal('Helpers/Recoverer', function(getInternal) {
    'use strict';

    var ObjectHelper = getInternal('Helpers/Object'),
        nextSubjects = {},
        MSG_RECOVERING = 'failed to load and tries to recover...';

    /**
     * @memberof JARS~internals.Helpers
     *
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {boolean}
     */
    function Recoverer(subject) {
        var nextConfig = getNextConfig(subject);

        if (nextConfig) {
            subject.logger.warn(MSG_RECOVERING);
            subject.config.update(ObjectHelper.merge({}, nextConfig));
            subject.handler.onCompleted();
        }

        return !!nextConfig;
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Configs.Hooks~Modules}
     */
    function getNextConfig(subject) {
        var subjectForConfig = getSubjectForConfig(subject),
            nextConfig = subject.config.getOwn('recover');

        if(subjectForConfig && !nextConfig) {
            nextConfig = subjectForConfig.config.get('recover');
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
        return ObjectHelper.hasOwnProp(nextSubjects, subject.name) ? nextSubjects[subject.name] : subject;
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

        return nextSubject && nextSubject.config.get('recover') === subject.config.get('recover') ? getNextSubjectForConfig(nextSubject) : nextSubject;
    }

    return Recoverer;
});
