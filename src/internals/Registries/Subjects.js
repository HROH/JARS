JARS.internal('Registries/Subjects', function(getInternal) {
    'use strict';

    var Injector = getInternal('Helpers/Injector'),
        AutoAborter = getInternal('Helpers/AutoAborter'),
        getBundleName = getInternal('Resolvers/Subjects/Bundle').getName,
        ROOT_MODULE = getInternal('Resolvers/Subjects/Module').ROOT,
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
            Subjects.get(getBundleName(moduleName)).$import(bundleModules);

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
            return Subjects.get(ROOT_MODULE);
        },
        /**
         * @return {JARS~internals.Subjects.Subject}
         */
        getRootBundle: function() {
            return Subjects.get(getBundleName(ROOT_MODULE));
        },
        /**
         * @param {string} scope
         * @param {string} switchToScope
         */
        flush: function(scope, switchToScope) {
            Injector.flush(scope);

            switchToScope && Subjects.getRootModule().config.update({
                scope: switchToScope
            });
        }
    };

    return Subjects;
});
