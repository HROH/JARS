JARS.internal('Handlers/Subject', function(getInternal) {
    'use strict';

    var reduce = getInternal('Helpers/Array').reduce,
        MSG_REQUESTED = '${0} "${1}" requested',
        MSG_LOADED = '${0} "${1}" loaded',
        MSG_ABORTED = 'missing ${0} "${1}"',
        SEPARATOR = '", "';

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {JARS~internals.Subjects.Subject[]} subjects
     * @param {string[]} msgStrings
     * @param {JARS~internals.Handlers.Completion~Subject} completionHandler
     */
    function Subject(requestor, subjects, msgStrings, completionHandler) {
        var handler = this;

        handler.requestor = requestor;
        handler.subjects = subjects;
        handler._msgStrings = msgStrings;
        handler._completionHandler = completionHandler;

        subjects.length && requestor.logger.debug(MSG_REQUESTED, [msgStrings[1] || msgStrings[0], join(subjects)]);
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {string} subjectName
         */
        onLoaded: function(subjectName) {
            this.requestor.logger.debug(MSG_LOADED, [this._msgStrings[0], subjectName]);
        },
        /**
         * @param {string} subjectName
         */
        onAborted: function(subjectName) {
            this.requestor.abort(MSG_ABORTED, [this._msgStrings[0], subjectName]);
        },
        /**
         * @param {JARS~internals.Refs.Subjects} refs
         */
        onCompleted: function(refs) {
            this._completionHandler.onCompleted(refs);
        }
    };

    /**
     * @memberof JARS~internals.Handlers.Subject
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject[]} subjects
     *
     * @return {string[]}
     */
    function join(subjects) {
        return reduce(subjects, function(subjectNames, subject) {
            subjectNames.push(subject.name);

            return subjectNames;
        }, []).join(SEPARATOR);
    }

    return Subject;
});
