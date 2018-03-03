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
        subject: [function(subjectName, injected) {
            return new SubjectConfig(injected.baseSubject, injected.parentConfig);
        }, ['baseSubject', 'parentConfig']]
    };

    return Config;
});
