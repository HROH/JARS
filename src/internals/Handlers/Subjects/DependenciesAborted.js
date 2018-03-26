JARS.internal('Handlers/Subjects/DependenciesAborted', function() {
    'use strict';

    var CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = 'found circular dependencies "${0}"';

    function DependenciesAborted(subject, circularDependencies) {
        this._subject = subject;
        this._deps = circularDependencies;
    }

    DependenciesAborted.prototype.onCompleted = function() {
        this._subject.abort(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [this._deps.join(CIRCULAR_SEPARATOR)]);
    };

    return DependenciesAborted;
});
