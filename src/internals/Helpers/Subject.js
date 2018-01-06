JARS.internal('Helpers/Subject', function(getInternal) {
    'use strict';

    var LogWrap = getInternal('Helpers/LogWrap'),
        State = getInternal('State'),
        Config = getInternal('Config'),
        Processors = getInternal('Processors'),
        Subject;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Subject = {
        /**
         * @param {JARS~internals.Bundle} bundle
         */
        addToBundle: function (bundle) {
            addToSubject(bundle, true);
        },
        /**
         * @param {JARS~internals.Module}
         */
        addToModule: function(module) {
            addToSubject(module);
        }
    };

    /**
     * @memberof JARS~internals.Helpers.Subject
     * @inner
     *
     * @param {(JARS~internals.Module|JARS~internals.Bundle)} subject
     * @param {boolean} isBundle
     */
    function addToSubject(subject, isBundle) {
        var factoryName = isBundle ? 'forBundle': 'forModule',
            Processor = Processors[isBundle ? 'bundle' : 'module'];

        subject.logger = LogWrap[factoryName](subject);
        subject.state = new State(subject);
        subject.config = Config[factoryName](subject);
        subject.processor = new Processor(subject);
    }

    return Subject;
});
