JARS.internal('Handlers/Completion/Dependencies', function(getInternal) {
    'use strict';

    var LOADED = getInternal('State/States').LOADED,
        CIRCULAR_SEPARATOR = '" -> "',
        MSG_ABORTED_CIRCULAR_DEPENDENCIES = 'found circular dependencies "${0}"';

    /**
     * @class
     * @implements {JARS~internals.Handlers.Completion~Subject}
     *
     * @memberof JARS~internals.Handlers.Completion
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Handlers.Completion.Dependencies~Provide} [provide]
     * @param {JARS~internals.Handlers.Completion.Dependencies~Progress} [progress]
     * @param {JARS~internals.Handlers.Completion.Dependencies~Error} [error]
     */
    function Dependencies(subject, provide, progress, error) {
        this._subject = subject;
        this._provide = provide;
        this._progress = progress;
        this._error = error;
    }

    Dependencies.prototype = {
        constructor: Dependencies,
        /**
         * @param {JARS~internals.Refs.Subjects} refs
         */
        onCompleted: function(refs) {
            var subject = this._subject,
                circularDeps = subject.dependencies.getCircular();

            if(circularDeps) {
                subject.abort(MSG_ABORTED_CIRCULAR_DEPENDENCIES, [circularDeps.join(CIRCULAR_SEPARATOR)]);
            }
            else if(!subject.state.is(LOADED)) {
                subject.ref.init(refs, this._provide);
                subject.stateUpdater.update(LOADED);

                // TODO
                if(subject.name.indexOf('anonymous_') === 0) {
                    subject.ref.get();
                }
            }
        },

        onSubjectLoaded: function(subjectName, percentage) {
            this._progress && this._progress(subjectName, percentage);
        },

        onSubjectAborted: function(subjectName) {
            this._error && this._error(subjectName);
        }
    };

    /**
     * @callback Provide
     *
     * @memberof JARS~internals.Handlers.Completion.Dependencies
     * @inner
     *
     * @param {...*} dependencyRefs
     *
     * @return {*}
     */

    /**
     * @callback Progress
     *
     * @memberof JARS~internals.Handlers.Completion.Dependencies
     * @inner
     *
     * @param {string} subjectName
     * @param {number} percentage
     */

    /**
     * @callback Error
     *
     * @memberof JARS~internals.Handlers.Completion.Dependencies
     * @inner
     *
     * @param {string} subjectName
     */

    return Dependencies;
});
