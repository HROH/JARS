JARS.internal('Helpers/Injector', function(getInternal) {
    'use strict';

    var SubjectTypes = getInternal('Types/Subject'),
        each = getInternal('Helpers/Object').each,
        Factories = getInternal('Factories'),
        injectors = {};

    /**
     * @class
     *
     * @memberof JARS~internals.Helpers
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
        inject: function(localSubjectName, localKey, localArgs) {
            return Injector.inject(localSubjectName, this.requestorName, localKey, localArgs);
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
    Injector.inject = function(subjectName, requestorName, key, args) {
        return subjectName ? getInjector(subjectName, requestorName).get(key, args) : null;
    };

    /**
     * @param {string} scope
     */
    Injector.flush = function(scope) {
        each(injectors, function(injector) {
            injector.flush(scope);
        });
    };

    /**
     * @memberof JARS~internals.Helpers.Injector
     * @inner
     *
     * @param {string} subjectName
     * @param {string} requestorName
     *
     * @return {JARS~internals.Helpers.Injector}
     */
    function getInjector(subjectName, requestorName) {
        var injectorKey = subjectName + ':' + getRequestorName(subjectName, requestorName);

        return injectors[injectorKey] || (injectors[injectorKey] = new Injector(subjectName, requestorName));
    }

    /**
     * @memberof JARS~internals.Helpers.Injector
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
