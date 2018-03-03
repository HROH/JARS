JARS.internal('Handlers/Subjects/Subject', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        MSG_REQUESTED = '${0} "${1}" requested',
        MSG_LOADED = '${0} "${1}" loaded',
        MSG_ABORTED = 'missing ${0} "${1}"',
        SEPARATOR = '", "';

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {JARS~internals.Subjects.Subject[]} subjects
     * @param {string[]} msgStrings
     * @param {JARS~internals.Handlers.Subjects.Subject#onCompleted} onCompleted
     */
    function Subject(requestor, subjects, msgStrings, onCompleted) {
        var handler = this;

        handler.requestor = requestor;
        handler.subjects = subjects;
        handler._msgStrings = msgStrings;
        handler.onCompleted = onCompleted;

        subjects.length && requestor.logger.debug(MSG_REQUESTED, [msgStrings[1] || msgStrings[0], join(subjects)]);
    }

    Subject.prototype = {
        constructor: Subject,
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         */
        onLoaded: function(subject) {
            this.requestor.logger.debug(MSG_LOADED, [this._msgStrings[0], subject.name]);
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         */
        onAborted: function(subject) {
            this.requestor.state.setAborted(MSG_ABORTED, [this._msgStrings[0], subject.name]);
        }
    };

    function join(subjects) {
        var subjectNames = [];

        each(subjects, function(subject) {
            subjectNames.push(subject.name);
        });

        return subjectNames.join(SEPARATOR);
    }

    /**
     * @method JARS~internals.Handlers.Subjects.Subject#onCompleted
     *
     * @param {JARS~internals.Refs.Modules} ref
     */

    return Subject;
});
