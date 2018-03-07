JARS.internal('Factories/Strategy', function(getInternal) {
    'use strict';

    var SubjectStrategy = getInternal('Strategies/Resolution/Subject'),
        BundleStrategy = getInternal('Strategies/Resolution/Bundle'),
        Strategy;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Strategy = {
        subject: function() {
            return SubjectStrategy;
        },

        bundle: function() {
            return BundleStrategy;
        }
    };

    return Strategy;
});
