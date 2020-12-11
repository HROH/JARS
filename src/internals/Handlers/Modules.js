JARS.internal('Handlers/Modules', function(getInternal) {
    'use strict';

    var SubjectsRef = getInternal('Refs/Subjects'),
        each = getInternal('Helpers/Array').each;

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Handlers.Subject} subjectHandler
     */
    function Modules(subjectHandler) {
        var handler = this;

        handler.requestor = subjectHandler.requestor;
        handler._subjectHandler = subjectHandler;
        handler._subjects = subjectHandler.subjects;
        handler._total = handler._subjects.length;
        handler._ref = new SubjectsRef();
        handler._loaded = 0;

        handler._checkCompleted();
    }

    Modules.prototype = {
        /**
         * @method
         */
        request: function() {
            var handler = this,
                ref = handler._ref;

            each(handler._subjects, function(subject, index) {
                ref.add(index, subject.ref);

                subject.load(handler);
            });
        },
        /**
         * @param {string} subjectName
         */
        onLoaded: function(subjectName) {
            var handler = this;

            handler._subjectHandler.onLoaded(subjectName, getPercentage(handler._loaded++, handler._total));
            handler._checkCompleted();
        },
        /**
         * @param {string} subjectName
         */
        onAborted: function(subjectName) {
            this._subjectHandler.onAborted(subjectName);
        },
        /**
         * @method
         */
        _checkCompleted: function() {
            this._loaded === this._total && this._subjectHandler.onCompleted(this._ref);
        }
    };

    /**
     * @param {JARS~internals.Handlers.Subject} subjectHandler
     */
    Modules.request = function(subjectHandler) {
        new Modules(subjectHandler).request();
    };

    /**
     * @memberof JARS~internals.Handlers.Modules
     * @inner
     *
     * @param {number} count
     * @param {number} total
     *
     * @return {number}
     */
    function getPercentage(count, total) {
        return Number((count / total).toFixed(2));
    }

    return Modules;
});
