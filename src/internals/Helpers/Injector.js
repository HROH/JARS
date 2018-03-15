JARS.internal('Helpers/Injector', function(getInternal) {
    'use strict';

    var isBundle = getInternal('Resolvers/Bundle').isBundle,
        isInterception = getInternal('Resolvers/Interception').isInterception,
        each = getInternal('Helpers/Object').each,
        Factories = getInternal('Factories'),
        SUBJECT_TYPE_MODULE = 'module',
        SUBJECT_TYPE_BUNDLE = 'bundle',
        SUBJECT_TYPE_INTERCEPTION = 'interception',
        injectors = {};

    /**
     * @class
     *
     * @memberof JARS~internals.Helpers
     *
     * @param {string} subjectName
     * @param {string} requestorName
     */
    function Injector(subjectName, requestorName, subjectType) {
        this.subjectName = subjectName;
        this.requestorName = requestorName;
        this.type = subjectType;
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
        injectLocal: function(localKey, localArgs) {
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
         * @param {string} context
         */
        flush: function(context) {
            this._cache.ref && this._cache.ref.flush(context);
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
        return subjectName ? getInjector(subjectName, requestorName).injectLocal(key, args) : null;
    };

    /**
     * @param {string} context 
     */
    Injector.flush = function(context) {
        each(injectors, function(injector) {
            injector.flush(context);
        });
    };

    /**
     * @param {string} subjectName
     * @param {string} requestorName
     *
     * @return {JARS~internals.Helpers.Injector}
     */
    function getInjector(subjectName, requestorName) {
        var subjectType = getSubjectType(subjectName),
            injectorKey;

        requestorName = subjectType === SUBJECT_TYPE_INTERCEPTION ? requestorName : subjectName;
        injectorKey = subjectName + ':' + requestorName;

        return injectors[injectorKey] || (injectors[injectorKey] = new Injector(subjectName, requestorName, subjectType));
    }
    
    /**
     * @param {string} subjectName
     *
     * @return {string}
     */
    function getSubjectType(subjectName) {
        return isInterception(subjectName) ? SUBJECT_TYPE_INTERCEPTION : isBundle(subjectName) ? SUBJECT_TYPE_BUNDLE : SUBJECT_TYPE_MODULE;
    }

    return Injector;
});
