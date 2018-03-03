JARS.internal('Refs/Subject', function(getInternal) {
    'use strict';

    var setCurrent = getInternal('Helpers/Tracker').setCurrent;

    /**
     * @class
     *
     * @memberof JARS~internals.Refs
     *
     * @param {JARS~internals.Subjects.Subject} subject
     */
    function Subject(subject) {
        this._subject = subject;
        this._contexts = {};
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {JARS~internals.Refs.Modules} refs
         * @param {JARS~internals.Subjects.Subject~Provide} provide
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
            context = context || this._subject.config.get('context');

            return this._contexts[context] || this._create(context);
        },
        /**
         * @param {string} context
         */
        flush: function(context) {
            this._contexts[context] = null;
            this._refs.flush(context);
        },
        /**
         * @param {string} context
         *
         * @return {*}
         */
        _create: function(context) {
            var subject = this._subject,
                contexts = this._contexts,
                parentRef, refs;

            if(!subject.isRoot) {
                parentRef = subject.parent.ref.get(context);
                refs = this._refs.get(context);

                setCurrent(subject);

                contexts[context] = this._provide.apply(parentRef, refs) || {};

                setCurrent();
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
