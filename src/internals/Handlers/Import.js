JARS.internal('Handlers/Import', function(getInternal) {
    'use strict';

    var request = getInternal('Handlers/Modules').request,
        rootModule = getInternal('Registries/Injector').getRootModule();

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
    function Import(moduleNames, onCompleted, onAborted, onLoaded) {
        return {
            requestor: rootModule,

            subjects: rootModule.dependencies.resolve(moduleNames),

            onLoaded: onLoaded || noop,

            onAborted: onAborted || noop,

            onCompleted: onCompleted ? function(refs) {
                onCompleted.apply(null, refs.get());
            } : noop
        };
    }

    /**
     * @param {JARS~internals.Subjects~Declaration} moduleNames
     * @param {function(...*)} [onCompleted]
     * @param {function(string)} [onAborted]
     * @param {function(string)} [onLoaded]
     */
    Import.$import = function(moduleNames, onCompleted, onAborted, onLoaded) {
        request(Import(moduleNames, onCompleted, onAborted, onLoaded));
    };

    /**
     * @memberof JARS~internals.Handlers.Import
     * @inner
     */
    function noop() {}

    return Import;
});
