JARS.internal('Handlers/Subjects', function(getInternal) {
    'use strict';

    var SubjectsRef = getInternal('Refs/Subjects'),
        ArrayHelper = getInternal('Helpers/Array'),
        MSG_REQUESTED = '${0} "${1}" requested',
        MSG_LOADED = '${0} "${1}" loaded (${2}%)',
        MSG_ABORTED = 'missing ${0} "${1}"',
        SEPARATOR = '", "';

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Subjects.Subject} requestor
     * @param {string[]} msgStrings
     * @param {JARS~internals.Handlers.Completion~Subject} completionHandler
     */
    function Subjects(requestor, msgStrings, completionHandler) {
        var handler = this;

        handler._requestor = requestor;
        handler._msgStrings = msgStrings;
        handler._completionHandler = completionHandler;
        handler._ref = new SubjectsRef();
        handler._loaded = 0;
    }

    Subjects.prototype = {
        /**
         * @param {JARS~internals.Subjects.Subject[]} subjects
         */
        request: function(subjects) {
            var handler = this,
                ref = handler._ref;

            handler._subjects = subjects;
            handler._total = subjects.length;

            subjects.length && handler._requestor.logger.debug(MSG_REQUESTED, [handler._msgStrings[1] || handler._msgStrings[0], join(subjects)]);

            handler._checkCompleted();

            ArrayHelper.each(handler._subjects, function(subject, index) {
                ref.add(index, subject.ref);

                subject.load(handler);
            });
        },
        /**
         * @param {string} subjectName
         */
        onLoaded: function(subjectName) {
            var handler = this,
                percentage = getPercentage(++handler._loaded, handler._total);

            handler._requestor.logger.debug(MSG_LOADED, [handler._msgStrings[0], subjectName, percentage]);
            handler._completionHandler.onSubjectLoaded && handler._completionHandler.onSubjectLoaded(subjectName, percentage);
            handler._checkCompleted();
        },
        /**
         * @param {string} subjectName
         */
        onAborted: function(subjectName) {
            this._completionHandler.onSubjectAborted && this._completionHandler.onSubjectAborted(subjectName);
            this._requestor.abort(MSG_ABORTED, [this._msgStrings[0], subjectName]);
        },
        /**
         * @method
         */
        _checkCompleted: function() {
            this._loaded === this._total && this._completionHandler.onCompleted(this._ref);
        }
    };

    /**
     * @param {JARS~internals.Handlers.Subject} subjectHandler
     */
    Subjects.request = function(subjectHandler) {
        new Subjects(subjectHandler).request();
    };

    /**
     * @memberof JARS~internals.Handlers.Subjects
     * @inner
     *
     * @param {number} count
     * @param {number} total
     *
     * @return {number}
     */
    function getPercentage(count, total) {
        return Math.round(Number((count / total).toFixed(2)) * 100);
    }

    /**
     * @memberof JARS~internals.Handlers.Subjects
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject[]} subjects
     *
     * @return {string[]}
     */
    function join(subjects) {
        return ArrayHelper.reduce(subjects, function(subjectNames, subject) {
            subjectNames.push(subject.name);

            return subjectNames;
        }, []).join(SEPARATOR);
    }

    return Subjects;
});
