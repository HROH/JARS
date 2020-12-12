JARS.internal('Refs/Subject', function(getInternal) {
    'use strict';

    var Tracker = getInternal('Helpers/Tracker'),
        SCOPE = getInternal('Configs/Options').SCOPE;

    /**
     * @class
     *
     * @memberof JARS~internals.Refs
     *
     * @param {string} subjectName
     * @param {JARS~internals.Refs.Subject} parentRef
     * @param {JARS~internals.Configs.Subject} config
     */
    function Subject(subjectName, parentRef, config) {
        this._subjectName = subjectName;
        this._parent = parentRef;
        this._config = config;
        this._scopes = {};
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {JARS~internals.Refs.Subjects} refs
         * @param {JARS~internals.Subjects.Subject~Provide} [provide]
         */
        init: function(refs, provide) {
            this._refs = refs;
            this._provide = provide || provideObject;
        },
        /**
         * @param {string} [scope]
         *
         * @return {*}
         */
        get: function(scope) {
            scope = scope || this._config.get(SCOPE);

            return this._scopes[scope] || this._create(scope);
        },
        /**
         * @param {string} scope
         */
        flush: function(scope) {
            this._scopes[scope] = null;
            this._refs && this._refs.flush(scope);
        },
        /**
         * @private
         *
         * @param {string} scope
         *
         * @return {*}
         */
        _create: function(scope) {
            var ref = this,
                scopes = ref._scopes,
                parentContent, contents;

            if(ref._parent) {
                parentContent = ref._parent.get(scope);
                contents = ref._refs.get(scope);

                Tracker.setCurrent(ref._subjectName);

                try {
                    scopes[scope] = ref._provide.apply(parentContent, contents) || {};
                } catch (error) {
                    scopes[scope] = {};
                    //TODO handle error

                    throw error;
                }
                finally {
                    Tracker.setCurrent();
                }
            }
            else {
                scopes[scope] = {};
            }

            return scopes[scope];
        }
    };

    /**
     * @memberof JARS~internals.Refs.Subject
     * @inner
     *
     * @return {Object}
     */
    function provideObject() {
        return {};
    }

    return Subject;
});
