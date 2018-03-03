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
        subject.$export(function() {
            var dependencies = subject.dependencies.getAll(),
                bundleExport = {
                    default: this
                };

            each(arguments, function(dep, index) {
                var dependencyName = dependencies[index].name;

                bundleExport[FileNameResolver(BundleResolver.isBundle(dependencyName) ? BundleResolver.removeBundleSuffix(dependencyName) : dependencyName)] = dep;
            });

            return bundleExport;
        });
    }

    return Bundle;
});
