JARS.internal('Registries/Subjects', function(getInternal) {
    'use strict';

    var Injector = getInternal('Helpers/Injector'),
        BundleResolver = getInternal('Resolvers/Bundle'),
        ParentResolver = getInternal('Resolvers/Parent'),
        AutoAborter = getInternal('Helpers/AutoAborter'),
        Subjects;
    
    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries
     */
    Subjects = {
        /**
         * @param {string} moduleName
         * @param {JARS~internals.Subjects~Declaration} bundleModules
         *
         * @return {JARS~internals.Subjects.Subject}
         */
        registerModule: function(moduleName, bundleModules) {
            var module = Subjects.get(moduleName);

            AutoAborter.clear(module);
            Subjects.get(BundleResolver.getBundleName(moduleName)).$import(bundleModules);

            return module;
        },
        /**
         * @param {string} subjectName
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {JARS~internals.Subjects.Subject}
         */
        get: function(subjectName, requestor) {
            return Injector.inject(subjectName, requestor && requestor.name, 'subject');
        },
        /**
         * @return {JARS~internals.Subjects.Subject}
         */
        getRootModule: function() {
            return Subjects.get(ParentResolver.ROOT);
        },
        /**
         * @return {JARS~internals.Subjects.Subject}
         */
        getRootBundle: function() {
            return Subjects.get(BundleResolver.ROOT);
        },
        /**
         * @param {string} context
         * @param {string} switchToContext
         */
        flush: function(context, switchToContext) {
            Injector.flush(context);

            switchToContext && Subjects.getRootModule().config.update({
                context: switchToContext
            });
        }
    };

    return Subjects;
});
