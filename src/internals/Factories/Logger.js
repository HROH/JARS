JARS.internal('Factories/Logger', function(getInternal) {
    'use strict';

    var SubjectLogger = getInternal('Helpers/Logger'),
        Logger;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Logger = {
        subject: function(injectLocal, inject) {
            return new SubjectLogger(injectLocal('description'), injectLocal('config'), injectLogger(inject, 'state'), injectLogger(inject, 'ref'));
        }
    };

    function injectLogger(inject, key) {
        return inject('System.Logger', key);
    }

    return Logger;
});
