JARS.internal('Helpers/Injector', function(getInternal) {
    'use strict';

    var Cache = getInternal('Helpers/Cache'),
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        isInterception = getInternal('Resolvers/Interception').isInterception,
        Factories = getInternal('Factories'),
        SUBJECT_TYPE_MODULE = 'module',
        SUBJECT_TYPE_BUNDLE = 'bundle',
        SUBJECT_TYPE_INTERCEPTION = 'interception',
        Injector, Getter;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Injector = {
        /**
         * @param {string} subjectName
         * @param {string} key
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {*}
         */
        inject: function(subjectName, key, requestor) {
            var subjectType = getSubjectType(subjectName);

            return getInjected(subjectName, key, subjectType === SUBJECT_TYPE_INTERCEPTION && requestor, subjectType);
        }
    };

    Getter = {
        $name: function(subjectName) {
            return subjectName;
        },

        $arg: function(subjectName, key, requestor) {
            return requestor;
        },
        /**
         * @memberof JARS~internals.Helpers.Injector
         * @inner
         *
         * @param {string} subjectName
         * @param {string} subjectType
         * @param {string} key
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {*}
         */
        factory: function(subjectName, key, requestor, subjectType) {
            return (Factories[key][subjectType] || Factories[key].subject)(function injectLocal(localKey) {
                return getInjected(subjectName, localKey, requestor, subjectType);
            }, Injector.inject);
        }
    };
    
    /**
     * @param {string} subjectName
     *
     * @return {string}
     */
    function getSubjectType(subjectName) {
        return isInterception(subjectName) ? SUBJECT_TYPE_INTERCEPTION : isBundle(subjectName) ? SUBJECT_TYPE_BUNDLE : SUBJECT_TYPE_MODULE;
    }

    /**
     * @memberof JARS~internals.Helpers.Injector
     * @inner
     *
     * @param {string} subjectName
     * @param {string} subjectType
     * @param {string} key
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {*}
     */
    function getInjected(subjectName, key, requestor, subjectType) {
        return Cache.get(subjectName, key, requestor) || Cache.set(subjectName, key, (Getter[key] || Getter.factory)(subjectName, key, requestor, subjectType), requestor);
    }

    return Injector;
});
