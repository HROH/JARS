JARS.internal('Handlers/Completion/Dependencies', function() {
    'use strict';

    var CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = 'found circular dependencies "${0}"';

    /**
     * @class
     * @implements {JARS~internals.Handlers.Completion~Subject}
     *
     * @memberof JARS~internals.Handlers.Completion
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject~Provide} provide
     */
    function Dependencies(subject, provide) {
        this._subject = subject;
        this._provide = provide;
    }

    /**
     * @param {JARS~internals.Refs.Modules} refs
     */
    Dependencies.prototype.onCompleted = function(refs) {
        var subject = this._subject,
            circularDeps = subject.dependencies.getCircular();

        if(circularDeps) {
            subject.abort(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [circularDeps.join(CIRCULAR_SEPARATOR)]);
        }
        else if(!subject.state.isLoaded()) {
            subject.ref.init(refs, this._provide);
            subject.stateUpdater.setLoaded();
        }
    };

    return Dependencies;
});
