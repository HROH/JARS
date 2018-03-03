JARS.internal('Registries/Subjects', function(getInternal) {
    'use strict';

    var BundleResolver = getInternal('Resolvers/Bundle'),
        InterceptionResolver = getInternal('Resolvers/Interception'),
        ParentResolver = getInternal('Resolvers/Parent'),
        AutoAborter = getInternal('Helpers/AutoAborter'),
        Cache = getInternal('Helpers/Cache'),
        each = getInternal('Helpers/Array').each,
        factories = getInternal('Factories'),
        SUBJECT_TYPE_MODULE = 'module',
        SUBJECT_TYPE_BUNDLE = 'bundle',
        SUBJECT_TYPE_INTERCEPTION = 'interception',
        Subjects;
    
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
            return inject(subjectName, 'subject', requestor);
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
            Cache.each(function flushModule(subject) {
                subject.ref.flush(context);
            });

            switchToContext && Subjects.getRootModule().config.update({
                context: switchToContext
            });
        }
    };
    
    /**
     * @param {string} subjectName
     *
     * @return {string}
     */
    function getSubjectType(subjectName) {
        return InterceptionResolver.isInterception(subjectName) ? SUBJECT_TYPE_INTERCEPTION : BundleResolver.isBundle(subjectName) ? SUBJECT_TYPE_BUNDLE : SUBJECT_TYPE_MODULE;
    }

    /**
     * @memberof JARS~internals.Registries.Subjects
     * @inner
     *
     * @param {string} subjectName
     * @param {string} subjectType
     * @param {string} key
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {*}
     */
    function callFactory(subjectName, subjectType, key, requestor) {
        var factory = getFactory(subjectType, key),
            injected = {
                $arg: requestor,

                $inject: inject
            };

        each(factory[1] || [], function(subKey) {
            injected[subKey] = getInjected(subjectName, subjectType, subKey, requestor);
        });

        return factory[0](subjectName, injected);
    }

    /**
     * @memberof JARS~internals.Registries.Subjects
     * @inner
     *
     * @param {string} subjectType
     * @param {string} key
     *
     * @return {[function(){}, string[]]}
     */
    function getFactory(subjectType, key) {
        return factories[key][subjectType] || factories[key].subject;
    }

    /**
     * @memberof JARS~internals.Registries.Subjects
     * @inner
     *
     * @param {string} subjectName
     * @param {string} subjectType
     * @param {string} key
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {*}
     */
    function getInjected(subjectName, subjectType, key, requestor) {
        return Cache.get(subjectName, key, requestor) || Cache.set(subjectName, key, callFactory(subjectName, subjectType, key, requestor), requestor);
    }

    /**
     * @memberof JARS~internals.Registries.Subjects
     * @inner
     *
     * @param {string} subjectName
     * @param {string} key
     * @param {JARS~internals.Subjects.Subject} [requestor]
     *
     * @return {*}
     */
    function inject(subjectName, key, requestor) {
        var subjectType = getSubjectType(subjectName);

        return getInjected(subjectName, subjectType, key, subjectType === SUBJECT_TYPE_INTERCEPTION && requestor);
    }

    return Subjects;
});
