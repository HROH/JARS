JARS.internal('Logger/Module', function(getInternal) {
    'use strict';

    var Logger = getInternal('Logger/Subject'),
        MODULE_LOG_CONTEXT_PREFIX = 'Module:';

    /**
     * @memberof JARS~internals.Logger
     *
     * @param {JARS~internals.Subjects.Module} module
     *
     * @return {JARS~internals.Logger.Subject}
     */
    function Module(module) {
        return new Logger(MODULE_LOG_CONTEXT_PREFIX + module.name);
    }

    return Module;
});
