JARS.internal('Factories/Config', function(getInternal) {
    'use strict';

    var SubjectConfig = getInternal('Configs/Subject'),
        Config;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Config = {
        subject: function(injectLocal) {
            return new SubjectConfig(injectLocal('baseSubject'), injectLocal('parentConfig'));
        }
    };

    return Config;
});
