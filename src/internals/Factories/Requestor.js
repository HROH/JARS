JARS.internal('Factories/Requestor', function() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    var Requestor = {
        subject: function(injectLocal) {
            return injectLocal('baseSubject');
        },

        interception: function(injectLocal) {
            return injectLocal('$arg');
        },
    };

    return Requestor;
});
