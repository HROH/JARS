JARS.internal('Subjects/Subject', function(getInternal) {
    'use strict';

    var ParentResolver = getInternal('Resolvers/Parent'),
        ParentLoadHandler = getInternal('Handlers/Subjects/Parent'),
        DependenciesLoadHandler = getInternal('Handlers/Subjects/Dependencies'),
        Modules = getInternal('Handlers/Modules');

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
     */
    function Subject(subjectName) {
        this.name = subjectName;
        this.isRoot = subjectName === ParentResolver.ROOT;
        this._meta = {};
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
            if (this.state.setRegistered()) {
                Modules.request(DependenciesLoadHandler(this, provide));
            }
        },
        /**
         * @param {JARS~internals.Handlers.Modules} handler
         */
        load: function(handler) {
            if (this.state.setLoading()) {
                Modules.request(ParentLoadHandler(this, this.handler));
            }

            this.state.onChange(handler);
        }
    };

    return Subject;
});
