JARS.internal('Factories/Logger', function(getInternal) {
    'use strict';

    var SubjectLogger = getInternal('Logger/Logger'),
        Transports = getInternal('Logger/Transports'),
        Console = getInternal('Logger/Console'),
        CONFIG = getInternal('Configs/Options').CONFIG;

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Helpers.Logger}
     */
    function Logger(injector) {
        var config = injector.get('config').get(CONFIG);

        return new SubjectLogger(injector.get('description') + injector.subjectName, new Transports([new Console(config)]), config);
    }

    return Logger;
});
