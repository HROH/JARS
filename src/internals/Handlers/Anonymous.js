JARS.internal('Handlers/Anonymous', function(getInternal) {
    'use strict';

    var rootModule = getInternal('Registries/Subjects').getRootModule(),
        SubjectsHandler = getInternal('Handlers/Subjects'),
        MSG_STRINGS = ['anonymous dependency', 'anonymous dependencies'];

    /**
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects~Declaration} moduleNames
     * @param {function(...*): void} [onCompleted]
     * @param {function(string): void} [onAborted]
     * @param {function(string): void} [onLoaded]
     */
    function Anonymous(moduleNames, onCompleted, onAborted, onLoaded) {
        var handler = new SubjectsHandler(rootModule, MSG_STRINGS, {
            onCompleted: function(refs) {
                onCompleted && onCompleted.apply(null, refs.get());
            },

            onSubjectLoaded: onLoaded,

            onSubjectAborted: onAborted
        });

        handler.request(rootModule.dependencies.resolve(moduleNames));
    }

    return Anonymous;
});
