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
     * @return {Object}
     */
    function getNextConfig(subject) {
        var subjectForConfig = getSubjectForConfig(subject),
            nextConfig = subject.config.getOwn('recover');

        if(subjectForConfig && !nextConfig) {
            nextConfig = subjectForConfig.config.get('recover');
            nextSubjects[subject.name] = subjectForConfig.getParentBundle();
        }

        return nextConfig;
    }

    /**
     * @memberof JARS~internals.Helpers.Recoverer
     * @inner
     *
     * @param {JARS~internals.Subjects.subject} subject
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    function getSubjectForConfig(subject) {
        return ObjectHelper.hasOwnProp(nextSubjects, subject.name) ? nextSubjects[subject.name] : subject;
    }

    return Recoverer;
});
