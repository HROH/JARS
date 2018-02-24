JARS.internal('Helpers/Subject', function(getInternal) {
    'use strict';

    var Logger = getInternal('Logger'),
        State = getInternal('States/Subject'),
        Configs = getInternal('Configs'),
        Processors = getInternal('Processors'),
        Subject;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Subject = {
        /**
         * @param {JARS~internals.Subjects.Bundle} bundle
         */
        initBundle: function (bundle) {
            initSubject(bundle, true);
        },
        /**
         * @param {JARS~internals.Subjects.Module} module
         */
        initModule: function(module) {
            initSubject(module);
        }
    };

    /**
     * @memberof JARS~internals.Helpers.Subject
     * @inner
     *
     * @param {JARS~internals.Subjects~Subject} subject
     * @param {boolean} isBundle
     */
    function initSubject(subject, isBundle) {
        var subjectType = isBundle ? 'bundle' : 'module',
            Processor = Processors[subjectType];

        subject.logger = Logger[subjectType](subject);
        subject.state = new State(subject);
        subject.config = Configs[subjectType](subject);
        subject.processor = new Processor(subject);
    }

    return Subject;
});
