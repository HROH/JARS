JARS.internal('Subjects/Subject', function(getInternal) {
    'use strict';

    var ParentLoadHandler = getInternal('Handlers/Subjects/Parent'),
        DependenciesLoadHandler = getInternal('Handlers/Subjects/Dependencies'),
        States = getInternal('State/States'),
        request = getInternal('Handlers/Modules').request,
        isRoot = getInternal('Resolvers/Subjects/Module').isRoot;

    /**
     * @callback Provide
     *
     * @memberof JARS~internals.Subjects.Subject
     * @inner
     *
     * @param {...*} dependencyRefs
     *
     * @return {*}
     */

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
        subject.requestor = injector.get('requestor') || subject;
        subject.config = injector.get('config');
        subject.ref = injector.get('ref');
        subject.logger = injector.get('logger');
        subject.state = injector.get('state');
        subject.stateUpdater = injector.get('stateUpdater');
        subject.dependencies = injector.get('dependencies', subject.requestor);
        subject.handler = injector.get('handler', subject);
        subject.info = injector.get('info');
        subject._injector = injector;
        subject._meta = {};
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {Object} meta
         */
        setMeta: function(meta) {
            this._meta = meta;
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
         * @param {JARS~internals.Subjects.Subject~Provide} provide
         */
        $export: function(provide) {
            if (this.stateUpdater.update(States.REGISTERED)) {
                request(DependenciesLoadHandler(this, provide));
            }
        },
        /**
         * @param {JARS~internals.Handlers.Modules} handler
         */
        load: function(handler) {
            if (this.stateUpdater.update(States.LOADING)) {
                request(ParentLoadHandler(this, this.handler));
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
