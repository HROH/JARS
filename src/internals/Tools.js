JARS.internal('Tools', function(getInternal) {
    'use strict';

    var LogWrap = getInternal('LogWrap'),
        State = getInternal('State'),
        Config = getInternal('Config'),
        Processors = getInternal('Processors'),
        Tools;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     */
    Tools = {
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
     * @memberof JARS~internals.Tools
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

    return Tools;
});
