JARS.internal('Handlers/Subjects/DependenciesCompleted', function() {
    'use strict';

    function DependenciesCompleted(state, stateUpdater, ref, provide) {
        this._state = state;
        this._stateUpdater = stateUpdater;
        this._ref = ref;
        this._provide = provide;
    }

    DependenciesCompleted.prototype.onCompleted = function(refs) {
        if(!this._state.isLoaded()) {
            this._ref.init(refs, this._provide);
            this._stateUpdater.setLoaded();
        }
    };

    return DependenciesCompleted;
});
