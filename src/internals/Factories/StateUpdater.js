JARS.internal('Factories/StateUpdater', function(getInternal) {
    'use strict';

    var Updater = getInternal('State/Updater');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Registries.Injector} injector
     *
     * @return {JARS~internals.State.Updater}
     */
    function StateUpdater(injector) {
        return new Updater(injector.get('state'), injector.get('logger'));
    }

    return StateUpdater;
});
