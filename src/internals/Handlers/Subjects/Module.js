JARS.internal('Handlers/Subjects/Module', function(getInternal) {
    'use strict';

    var AutoAborter = getInternal('Helpers/AutoAborter'),
        PathResolver = getInternal('Resolvers/Path'),
        loadSource = getInternal('SourceManager').load;

    /**
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject 
     */
    function Module(subject) {
        var path = PathResolver(subject);

        AutoAborter.setup(subject, path);
        loadSource(path);
    }

    return Module;
});
