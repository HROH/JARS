JARS.internal('Factories/Config', function(getInternal) {
    'use strict';

    var SubjectConfig = getInternal('Configs/Subject');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Configs.Subject}
     */
    function Config(injector) {
        return new SubjectConfig(injector.subjectName, injector.get('options'));
    }

    return Config;
});
