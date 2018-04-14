JARS.internal('Handlers/Completion/Module', function(getInternal) {
    'use strict';

    var AutoAborter = getInternal('Helpers/AutoAborter'),
        PathResolver = getInternal('Resolvers/Path'),
        loadSource = getInternal('SourceManager').load;

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
        var path = PathResolver(this._subject);

        AutoAborter.setup(this._subject, path);
        loadSource(path);
    };

    return Module;
});
