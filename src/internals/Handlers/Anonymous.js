JARS.internal('Handlers/Anonymous', function(getInternal) {
    'use strict';

    var rootModule = getInternal('Registries/Injector').getRootModule();

    /**
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects~Declaration} moduleNames
     * @param {function(...*)} [onCompleted]
     * @param {function(string)} [onAborted]
     * @param {function(string)} [onLoaded]
     *
     * @return {JARS~internals.Handlers.Subjects.Subject}
     */
    function Anonymous(moduleNames, onCompleted, onAborted, onLoaded) {
        this.requestor = rootModule;
        this.subjects = rootModule.dependencies.resolve(moduleNames);
        this.onLoaded = onLoaded || noop;
        this.onAborted = onAborted || noop;
        this.onCompleted = onCompleted ? function(refs) {
            onCompleted.apply(null, refs.get());
        } : noop;
    }

    /**
     * @memberof JARS~internals.Handlers.Import
     * @inner
     */
    function noop() {}

    return Anonymous;
});
