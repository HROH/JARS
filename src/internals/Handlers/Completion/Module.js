JARS.internal('Handlers/Completion/Module', function(getInternal) {
    'use strict';

    var AutoAborter = getInternal('Helpers/AutoAborter');

    /**
     * @class
     * @implements {JARS~internals.Handlers.Completion~Subject}
     *
     * @memberof JARS~internals.Handlers.Completion
     *
     * @param {JARS~internals.Subjects.Subject} subject
     */
    function Module(subject) {
        this._subject = subject;
    }

    Module.prototype.onCompleted = function() {
        AutoAborter.setup(this._subject);
    };

    return Module;
});
