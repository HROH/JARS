JARS.internal('Registries/Subjects', function(getInternal) {
    'use strict';

    var SubjectTypes = getInternal('Types/Subject'),
        Injector = getInternal('Registries/Injector'),
        AutoAborter = getInternal('Helpers/AutoAborter'),
        getBundleName = getInternal('Resolvers/Subjects/Bundle').getName,
        ModuleResolver = getInternal('Resolvers/Subjects/Module'),
        each = getInternal('Helpers/Object').each,
        injectors = {},
        Subjects;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries
     */
    Subjects = {
        /**
         * @param {string} subjectName
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {JARS~internals.Registries.Injector}
         */
        getInjectorForSubject: function(subjectName, requestor) {
            var isInterception = SubjectTypes.isInterception(subjectName),
                injectorKey = subjectName + ':' + (isInterception ? requestor.name : subjectName);

            return injectors[injectorKey] || (injectors[injectorKey] = new Injector(Subjects, subjectName, isInterception ? requestor : null));
        },
        /**
         * @param {string} moduleName
         * @param {JARS~internals.Subjects~Declaration} bundleModules
         *
         * @return {JARS~internals.Subjects.Subject}
         */
        registerModule: function(moduleName, bundleModules) {
            var module = Subjects.getSubject(moduleName);

            AutoAborter.clear(module);
            Subjects.getSubject(getBundleName(moduleName)).$import(bundleModules);

            return module;
        },
        /**
         * @param {string} subjectName
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {JARS~internals.Subjects.Subject}
         */
        getSubject: function(subjectName, requestor) {
            return Subjects.getInjectorForSubject(subjectName, requestor).get('subject');
        },
        /**
         * @return {JARS~internals.Subjects.Subject}
         */
        getRootModule: function() {
            return Subjects.getSubject(ModuleResolver.ROOT);
        },
        /**
         * @return {JARS~internals.Subjects.Subject}
         */
        getRootBundle: function() {
            return Subjects.getSubject(getBundleName(ModuleResolver.ROOT));
        },
        /*
         * @return {JARS~internals.Subjects.Subject}
         */
        getAnonymousModule: function() {
            return Subjects.getSubject(ModuleResolver.getAnonymousName());
        },
        /**
         * @param {string} scope
         * @param {string} switchToScope
         */
        flush: function(scope, switchToScope) {
            each(injectors, function(injector) {
                injector.flush(scope);
            });

            switchToScope && Subjects.getRootModule().config.update({
                scope: switchToScope
            });
        }
    };

    return Subjects;
});
