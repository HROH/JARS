JARS.internal('Registries/Injector', function(getInternal) {
    'use strict';

    var SubjectTypes = getInternal('Types/Subject'),
        AutoAborter = getInternal('Helpers/AutoAborter'),
        getBundleName = getInternal('Resolvers/Subjects/Bundle').getName,
        ROOT_MODULE = getInternal('Resolvers/Subjects/Module').ROOT,
        each = getInternal('Helpers/Object').each,
        Factories = getInternal('Factories'),
        injectors = {};

    /**
     * @class
     *
     * @memberof JARS~internals.Registries
     *
     * @param {string} subjectName
     * @param {JARS~internals.Subjects.Subject} [requestor]
     */
    function Injector(subjectName, requestor) {
        this.subjectName = subjectName;
        this.type = SubjectTypes.get(subjectName);
        this.requestor = requestor;
        this._cache = {};
    }

    Injector.prototype = {
        constructor: Injector,
        /**
         * @param {string} localKey
         * @param {*} localArgs
         *
         * @return {*}
         */
        get: function(localKey, localArgs) {
            return this._cache[localKey] || (this._cache[localKey] = Factories[localKey](this, localArgs));
        },
        /**
         * @param {string} localSubjectName
         * @param {string} localKey
         * @param {*} localArgs
         *
         * @return {*}
         */
        getGlobal: function(localSubjectName, localKey, localArgs) {
            return localSubjectName ? Injector.forSubject(localSubjectName, this.requestor).get(localKey, localArgs) : null;
        },
        /**
         * @param {string} scope
         */
        flush: function(scope) {
            this._cache.ref && this._cache.ref.flush(scope);
        }
    };

    /**
     * @memberof JARS~internals.Registries.Injector
     * @inner
     *
     * @param {string} subjectName
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {JARS~internals.Registries.Injector}
     */
    Injector.forSubject = function(subjectName, requestor) {
        var isInterception = SubjectTypes.isInterception(subjectName),
            injectorKey = subjectName + ':' + (isInterception ? requestor.name : subjectName);

        return injectors[injectorKey] || (injectors[injectorKey] = new Injector(subjectName, isInterception ? requestor : null));
    };

    /**
     * @param {string} moduleName
     * @param {JARS~internals.Subjects~Declaration} bundleModules
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    Injector.registerModule = function(moduleName, bundleModules) {
        var module = Injector.getSubject(moduleName);

        AutoAborter.clear(module);
        Injector.getSubject(getBundleName(moduleName)).$import(bundleModules);

        return module;
    };

    /**
     * @param {string} subjectName
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {JARS~internals.Subjects.Subject}
     */
    Injector.getSubject = function(subjectName, requestor) {
        return Injector.forSubject(subjectName, requestor).get('subject');
    };

    /**
     * @return {JARS~internals.Subjects.Subject}
     */
    Injector.getRootModule = function() {
        return Injector.getSubject(ROOT_MODULE);
    };

    /**
     * @return {JARS~internals.Subjects.Subject}
     */
    Injector.getRootBundle = function() {
        return Injector.getSubject(getBundleName(ROOT_MODULE));
    };

    /**
     * @param {string} scope
     * @param {string} switchToScope
     */
    Injector.flush = function(scope, switchToScope) {
        each(injectors, function(injector) {
            injector.flush(scope);
        });

        switchToScope && Injector.getRootModule().config.update({
            scope: switchToScope
        });
    };

    return Injector;
});
