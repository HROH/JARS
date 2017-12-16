JARS.internal('Tools', function(getInternal) {
    'use strict';

    var LogWrap = getInternal('LogWrap'),
        State = getInternal('State'),
        Config = getInternal('Config'),
        Processors = getInternal('Processors'),
        Tools;

    Tools = {
        addToBundle: function (bundle) {
            addToSubject(bundle, true);
        },

        addToModule: function(module) {
            addToSubject(module);
        }
    };

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
