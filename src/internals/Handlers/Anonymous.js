JARS.internal('Handlers/Anonymous', function(getInternal) {
    'use strict';

    var rootModule = getInternal('Registries/Injector').getRootModule(),
        SubjectHandler = getInternal('Handlers/Subject');

    /**
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects~Declaration} moduleNames
     * @param {function(...*)} [onCompleted]
     * @param {function(string)} [onAborted]
     * @param {function(string)} [onLoaded]
     *
     * @return {JARS~internals.Handlers.Subject}
     */
    function Anonymous(moduleNames, onCompleted, onAborted, onLoaded) {
        var handler = new SubjectHandler(rootModule, rootModule.dependencies.resolve(moduleNames), ['anonymous dependency', 'anonymous dependencies'], {
            onCompleted: onCompleted ? function(refs) {
                onCompleted.apply(null, refs.get());
            } : noop
        });

        onLoaded && (handler.onLoaded = onLoaded);
        onAborted && (handler.onAborted = onAborted);

        return handler;
    }

    /**
     * @memberof JARS~internals.Handlers.Anonymous
     * @inner
     */
    function noop() {}

    return Anonymous;
});
