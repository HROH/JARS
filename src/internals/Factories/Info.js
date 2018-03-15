JARS.internal('Factories/Info', function(getInternal) {
    'use strict';

    var getInfo = getInternal('Resolvers/Interception').getInfo;

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.Resolvers.Interception~Info}
     */
    function Info(injector) {
        return getInfo(injector.subjectName);
    }

    return Info;
});
