JARS.internal('Refs/Subject', function(getInternal) {
    'use strict';

    var Tracker = getInternal('Helpers/Tracker'),
        CONTEXT = getInternal('Configs/Options').CONTEXT;

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
        this._contexts = {};
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {JARS~internals.Refs.Modules} refs
         * @param {JARS~internals.Subjects.Subject~Provide} [provide]
         */
        init: function(refs, provide) {
            this._refs = refs;
            this._provide = provide || provideObject;
        },
        /**
         * @param {string} [context]
         *
         * @return {*}
         */
        get: function(context) {
            context = context || this._config.get(CONTEXT);

            return this._contexts[context] || this._create(context);
        },
        /**
         * @param {string} context
         */
        flush: function(context) {
            this._contexts[context] = null;
            this._refs && this._refs.flush(context);
        },
        /**
         * @private
         *
         * @param {string} context
         *
         * @return {*}
         */
        _create: function(context) {
            var ref = this,
                contexts = ref._contexts,
                parentContent, contents;

            if(ref._parent) {
                parentContent = ref._parent.get(context);
                contents = ref._refs.get(context);

                Tracker.setCurrent(ref._subjectName);

                try {
                    contexts[context] = ref._provide.apply(parentContent, contents) || {};
                } catch (error) {
                    contexts[context] = {};
                    //TODO handle error

                    throw error;
                }
                finally {
                    Tracker.setCurrent();
                }
            }
            else {
                contexts[context] = {};
            }

            return contexts[context];
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
