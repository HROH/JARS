JARS.internal('Handlers/Completion/Bundle', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        getBundleParentName = getInternal('Resolvers/Subjects/Bundle').getParentName,
        each = getInternal('Helpers/Array').each;

    /**
     * @class
     * @implements {JARS~internals.Handlers.Completion~Subject}
     *
     * @memberof JARS~internals.Handlers.Completion
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
                bundleExport[FileNameResolver(getBundleParentName(dependencies[index].name))] = dep;
            });

            return bundleExport;
        });
    };

    return Bundle;
});