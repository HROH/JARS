JARS.internal('Subjects/Subject', function(getInternal) {
    'use strict';

    var ParentLoadHandler = getInternal('Handlers/Subjects/Parent'),
        DependenciesLoadHandler = getInternal('Handlers/Subjects/Dependencies'),
        Modules = getInternal('Handlers/Modules'),
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
     * @param {JARS~internals.Subjects.Subject} parent
     * @param {(JARS~internals.Subjects.Subject|null)} requestor
     * @param {JARS~internals.Helpers.Injector} injector
     */
    function Subject(subjectName, parent, requestor, injector) {
        var subject = this;

        subject.name = subjectName;
        subject.isRoot = isRoot(subjectName);
        subject.parent = parent;
        subject.requestor = requestor || subject;
        subject.config = injector.injectLocal('config');
        subject.ref = injector.injectLocal('ref');
        subject.logger = injector.injectLocal('logger');
        subject.state = injector.injectLocal('state');
        subject.stateUpdater = injector.injectLocal('stateUpdater');
        subject.dependencies = injector.injectLocal('dependencies', subject.requestor);
        subject.handler = injector.injectLocal('handler', subject);
        subject.info = injector.injectLocal('info');
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
         * @param {JARS~internals.Subjects~Declaration} dependencies
         */
        $import: function(dependencies) {
            this.dependencies.add(dependencies);
        },
        /**
         * @param {JARS~internals.Subjects.Subject~Provide} provide
         */
        $export: function(provide) {
            if (this.stateUpdater.setRegistered()) {
                Modules.request(DependenciesLoadHandler(this, provide));
            }
        },
        /**
         * @param {JARS~internals.Handlers.Modules} handler
         */
        load: function(handler) {
            if (this.stateUpdater.setLoading()) {
                Modules.request(ParentLoadHandler(this, this.handler));
            }

            this.state.onChange(handler);
        },
        /**
         * @param {string} [message]
         * @param {Object} [logInfo]
         */
        abort: function(message, logInfo) {
            this.stateUpdater.setAborted(message, logInfo);
        }
    };

    return Subject;
});
