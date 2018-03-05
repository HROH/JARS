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
        subject: [function(subjectName, injected) {
            return new SubjectLogger(injected.description + ':' + subjectName, injected.config, injectLogger(injected, 'state'), injectLogger(injected, 'ref'));
        }, ['config', 'description']]
    };

    function injectLogger(injected, key) {
        return injected.$inject('System.Logger', key);
    }

    return Logger;
});
