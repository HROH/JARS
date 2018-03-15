JARS.internal('Handlers/Subjects/Bundle', function(getInternal) {
    'use strict';

    var BundleResolver = getInternal('Resolvers/Bundle'),
        FileNameResolver = getInternal('Resolvers/FileName'),
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

                bundleExport[FileNameResolver(BundleResolver.isBundle(dependencyName) ? BundleResolver.removeBundleSuffix(dependencyName) : dependencyName)] = dep;
            });

            return bundleExport;
        });
    };

    return Bundle;
});
