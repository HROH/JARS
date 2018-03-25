JARS.internal('Handlers/Subjects/Bundle', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        isBundle = getInternal('Types/Subject').isBundle,
        removeBundleSuffix = getInternal('Resolvers/Bundle').removeBundleSuffix,
        each = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Handlers.Subjects
     *
     * @param {JARS~internals.Subjects.Subject} subject
     */
    function Bundle(subject) {
        this._subject = subject;
    }

    Bundle.prototype.onCompleted = function() {
        var dependencies = this._subject.dependencies.getAll();

        this._subject.$export(function() {
            var bundleExport = {
                default: this
            };

            each(arguments, function(dep, index) {
                var dependencyName = dependencies[index].name;

                bundleExport[FileNameResolver(isBundle(dependencyName) ? removeBundleSuffix(dependencyName) : dependencyName)] = dep;
            });

            return bundleExport;
        });
    };

    return Bundle;
});
