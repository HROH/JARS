JARS.internal('Registries/Injector', function(getInternal) {
    'use strict';

    var SubjectTypes = getInternal('Types/Subject'),
        Factories = getInternal('Factories');

    /**
     * @class
     *
     * @memberof JARS~internals.Registries
     *
     * @param {registry} JARS~internals.Registries.Subjects
     * @param {string} subjectName
     * @param {JARS~internals.Subjects.Subject} [requestor]
     */
    function Injector(registry, subjectName, requestor) {
        this.subjectName = subjectName;
        this.type = SubjectTypes.get(subjectName);
        this.requestor = requestor;
        this._registry = registry;
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
            return localSubjectName ? this._registry.getInjectorForSubject(localSubjectName, this.requestor).get(localKey, localArgs) : null;
        },
        /**
         * @param {string} scope
         */
        flush: function(scope) {
            this._cache.ref && this._cache.ref.flush(scope);
        }
    };

    return Injector;
});
