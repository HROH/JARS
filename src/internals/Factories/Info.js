JARS.internal('Factories/Info', function(getInternal) {
    'use strict';

    var extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo;

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Resolvers.Interception~Info}
     */
    function Info(injector) {
        return extractInterceptionInfo(injector.subjectName);
    }

    return Info;
});
