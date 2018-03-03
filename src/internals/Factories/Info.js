JARS.internal('Factories/Info', function(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    var Info = {
        subject: [function() {}],

        interception: [getInternal('Resolvers/Interception').extractInterceptionInfo]
    };

    return Info;
});
