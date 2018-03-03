JARS.internal('Factories/ResolutionStrategy', function(getInternal) {
    'use strict';

    var SubjectStrategy = getInternal('Strategies/Resolution/Subject'),
        BundleStrategy = getInternal('Strategies/Resolution/Bundle'),
        ResolutionStrategy;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    ResolutionStrategy = {
        subject: [function() {
            return SubjectStrategy;
        }],

        bundle: [function() {
            return BundleStrategy;
        }]
    };

    return ResolutionStrategy;
});
