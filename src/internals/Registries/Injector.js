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
     * @param {string} requestorName
     */
    function Injector(subjectName, requestorName) {
        this.subjectName = subjectName;
        this.type = SubjectTypes.get(subjectName);
        this.requestorName = getRequestorName(subjectName, requestorName);
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
            return Injector.get(localSubjectName, this.requestorName, localKey, localArgs);
        },
        /**
         * @param {string} scope
         */
        flush: function(scope) {
            this._cache.ref && this._cache.ref.flush(scope);
        }
    };

    /**
     * @param {string} subjectName
     * @param {string} requestorName
     * @param {string} key
     * @param {*} args
     *
     * @return {*}
     */
    Injector.get = function(subjectName, requestorName, key, args) {
        return subjectName ? getInjector(subjectName, requestorName).get(key, args) : null;
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
        return Injector.get(subjectName, requestor && requestor.name, 'subject');
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

    /**
     * @memberof JARS~internals.Registries.Injector
     * @inner
     *
     * @param {string} subjectName
     * @param {string} requestorName
     *
     * @return {JARS~internals.Registries.Injector}
     */
    function getInjector(subjectName, requestorName) {
        var injectorKey = subjectName + ':' + getRequestorName(subjectName, requestorName);

        return injectors[injectorKey] || (injectors[injectorKey] = new Injector(subjectName, requestorName));
    }

    /**
     * @memberof JARS~internals.Registries.Injector
     * @inner
     *
     * @param {string} subjectName
     * @param {string} requestorName
     *
     * @return {string}
     */
    function getRequestorName(subjectName, requestorName) {
        return SubjectTypes.isInterception(subjectName) ? requestorName : subjectName;
    }

    return Injector;
});
