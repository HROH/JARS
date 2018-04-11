JARS.internal('Factories/Logger', function(getInternal) {
    'use strict';

    var SubjectLogger = getInternal('Helpers/Logger');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Helpers.Logger}
     */
    function Logger(injector) {
        return new SubjectLogger(injector.get('description') + injector.subjectName, injector.get('config'), injectLogger(injector, 'state'), injectLogger(injector, 'ref'));
    }

    /**
     * @memberof JARS~internals.Factories.Logger
     * @inner
     *
     * @param {JARS~internals.Helpers.injector} injector
     * @param {string} key
     *
     * @return {*}
     */
    function injectLogger(injector, key) {
        return injector.inject('System.Logger', key);
    }

    return Logger;
});
