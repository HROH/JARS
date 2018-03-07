JARS.internal('Factories/Subject', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        subjectProperties = ['logger', 'state', 'dependencies', 'config', 'ref', 'parent', 'requestor', 'handler', 'info'],
        Subject;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Factories
     */
    Subject = {
        subject: function(injectLocal) {
            var subject = injectLocal('baseSubject');

            each(subjectProperties, function(prop) {
                subject[prop] = injectLocal(prop);
            });

            return subject;
        }
    };

    return Subject;
});
