JARS.internal('Factories/StateUpdater', function(getInternal) {
    'use strict';

    var Updater = getInternal('States/Updater');
    
    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     *
     * @return {JARS~internals.States.Updater}
     */
    function StateUpdater(injector) {
        return new Updater(injector.injectLocal('state'), injector.injectLocal('logger'));
    }

    return StateUpdater;
});
