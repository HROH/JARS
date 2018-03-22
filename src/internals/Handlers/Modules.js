JARS.internal('Handlers/Modules', function(getInternal) {
    'use strict';

    var ModulesRef = getInternal('Refs/Modules'),
        each = getInternal('Helpers/Array').each;

    /**
     * @class
     *
     * @memberof JARS~internals.Handlers
     *
     * @param {JARS~internals.Handlers.Subjects.Subject} requestHandler
     */
    function Modules(requestHandler) {
        var handler = this;

        handler.requestor = requestHandler.requestor;
        handler._nextHandler = requestHandler;
        handler._subjects = requestHandler.subjects;
        handler._total = handler._subjects.length;
        handler._ref = new ModulesRef();
        handler._loaded = 0;

        handler.onCompleted();
    }

    Modules.prototype = {
        /**
         * @method
         */
        request: function() {
            var handler = this;

            each(handler._subjects, function(subject, index) {
                handler.requestSubject(subject, index);
            });
        },
        /**
         * @param {JARS~internals.Subjects.Subject} subject
         * @param {number} index
         */
        requestSubject: function(subject, index) {
            this._ref.add(index, subject.ref);

            subject.load(this);
        },
        /**
         * @param {string} subjectName
         */
        onLoaded: function(subjectName) {
            var handler = this;

            handler._nextHandler.onLoaded(subjectName, getPercentage(handler._loaded++, handler._total));
            handler.onCompleted();
        },
        /**
         * @param {string} subjectName
         */
        onAborted: function(subjectName) {
            this._nextHandler.onAborted(subjectName);
        },
        /**
         * @method
         */
        onCompleted: function() {
            this._loaded === this._total && this._nextHandler.onCompleted(this._ref);
        }
    };

    /**
     * @param {JARS~internals.Handlers.Subjects.Subject} requestHandler
     */
    Modules.request = function(requestHandler) {
        new Modules(requestHandler).request();
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
