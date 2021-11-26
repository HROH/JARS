JARS.internal('Subjects/Subject', function(getInternal) {
    'use strict';

    var States = getInternal('State/States'),
        isRoot = getInternal('Resolvers/Subjects/Module').isRoot,
        merge = getInternal('Helpers/Object').merge;

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects
     *
     * @param {string} subjectName
     * @param {JARS~internals.Registries.Injector} injector
     */
    function Subject(subjectName, injector) {
        var subject = this;

        subject.name = subjectName;
        subject.isRoot = isRoot(subjectName);
        subject.parent = injector.get('parent');
        subject.requestor = injector.requestor;
        subject.config = injector.get('config');
        subject.ref = injector.get('ref');
        subject.logger = injector.get('logger');
        subject.state = injector.get('state');
        subject.stateUpdater = injector.get('stateUpdater');
        subject.dependencies = injector.get('dependencies', subject.requestor || subject);
        subject.info = injector.get('info');
        subject._injector = injector;
        subject._meta = {};
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {{plugIn: [function]}} meta
         */
        setMeta: function(meta) {
            merge(this._meta, meta);
        },
        /**
         * @param {string} metaProp
         *
         * @return {*}
         */
        getMeta: function(metaProp) {
            return this._meta[metaProp];
        },
        /**
         * @return {(JARS~internals.Subjects.Subject|null)}
         */
        getParentBundle: function() {
            return this._injector.get('parentBundle');
        },
        /**
         * @param {JARS~internals.Subjects~Declaration} dependencies
         */
        $import: function(dependencies) {
            this.dependencies.add(dependencies);
        },
        /**
         * @param {JARS~internals.Handlers.Completion.Dependencies~Provide} provide
         * @param {JARS~internals.Handlers.Completion.Dependencies~Progress} progress
         * @param {JARS~internals.Handlers.Completion.Dependencies~Error} error
         */
        $export: function(provide, progress, error) {
            if (this.stateUpdater.update(States.REGISTERED)) {
                this._injector.get('dependenciesHandler', {
                    provide: provide,

                    progress: progress,

                    error: error
                }).request(this.dependencies.getNotCircular());
            }
        },
        /**
         * @param {JARS~internals.Handlers.Subjects} handler
         */
        load: function(handler) {
            if (this.stateUpdater.update(States.LOADING)) {
                this._injector.get('parentHandler').request([this.parent]);
            }

            this.state.onChange(handler);
        },
        /**
         * @param {string} [message]
         * @param {Object} [logInfo]
         */
        abort: function(message, logInfo) {
            this.stateUpdater.update(States.ABORTED, message, logInfo);
        }
    };

    return Subject;
});
