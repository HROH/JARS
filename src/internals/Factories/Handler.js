JARS.internal('Factories/Handler', function(getInternal) {
    'use strict';

    var Handlers = getInternal('Handlers/Subjects');

    /**
     * @memberof JARS~internals.Factories
     *
     * @param {JARS~internals.Helpers.Injector} injector
     * @param {JARS~internals.Subjects.Subject} subject
     *
     * @return {JARS~internals.Handlers~Completion}
     */
    function Handler(injector, subject) {
        return new Handlers[injector.type](subject);
    }

    return Handler;
});
