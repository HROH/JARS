JARS.internal('Factories/Info', function(getInternal) {
    'use strict';

    var extractInterceptionInfo = getInternal('Resolvers/Interception').extractInterceptionInfo;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    var Info = {
        subject: function() {},

        interception: function(injectLocal) {
            return extractInterceptionInfo(injectLocal('$name'));
        }
    };

    return Info;
});
