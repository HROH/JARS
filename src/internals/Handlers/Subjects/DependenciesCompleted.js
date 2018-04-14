JARS.internal('Handlers/Subjects/DependenciesCompleted', function() {
    'use strict';

    /**
     * @class
     * @implements {JARS~internals.Handlers.Subjects~Completion}
     *
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.subject} subject
     * @param {JARS~internals.Subjects.Subject~Provide} provide
     */
    function DependenciesCompleted(subject, provide) {
        this._subject = subject;
        this._provide = provide;
    }

    /**
     * @param {JARS~internals.Refs.Modules} refs
     */
    DependenciesCompleted.prototype.onCompleted = function(refs) {
        if(!this._subject.state.isLoaded()) {
            this._subject.ref.init(refs, this._provide);
            this._subject.stateUpdater.setLoaded();
        }
    };

    return DependenciesCompleted;
});
