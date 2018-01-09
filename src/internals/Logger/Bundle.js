JARS.internal('Logger/Bundle', function(getInternal) {
    'use strict';

    var Logger = getInternal('Logger/Subject'),
        BUNDLE_LOG_CONTEXT_PREFIX = 'Bundle:';

    /**
     * @memberof JARS~internals.Logger
     *
     * @param {JARS~internals.Subjects.Module} module
     *
     * @return {JARS~internals.Logger.Subject}
     */
    function Bundle(module) {
        return new Logger(BUNDLE_LOG_CONTEXT_PREFIX + module.name);
    }

    return Bundle;
});
