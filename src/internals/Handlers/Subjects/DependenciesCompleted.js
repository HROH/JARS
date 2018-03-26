JARS.internal('Handlers/Subjects/DependenciesCompleted', function() {
    'use strict';

    function DependenciesCompleted(subject, provide) {
        this._subject = subject;
        this._provide = provide;
    }

    DependenciesCompleted.prototype.onCompleted = function(refs) {
        if(!this._subject.state.isLoaded()) {
            this._subject.ref.init(refs, this._provide);
            this._subject.stateUpdater.setLoaded();
        }
    };

    return DependenciesCompleted;
});
