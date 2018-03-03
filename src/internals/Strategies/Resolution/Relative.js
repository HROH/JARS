JARS.internal('Strategies/Resolution/Relative', function(getInternal) {
    'use strict';

    var RelativeResolver = getInternal('Resolvers/Relative'),
        AbsoluteResolutionStrategy = getInternal('Strategies/Resolution/Absolute');

    /**
     * @memberof JARS~internals.Strategies.Resolution
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} subjectName
     *
     * @return {{error: string, name: string}}
     */
    function Relative(subject, subjectName) {
        return ((!subject.isRoot && RelativeResolver(subjectName)) ?
            Relative(subject.parent, subjectName.substr(1)) :
            AbsoluteResolutionStrategy(subject, subjectName));
    }

    return Relative;
});
