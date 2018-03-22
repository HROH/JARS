JARS.internal('Resolvers/Interception', function(getInternal) {
    'use strict';

    var eachInterceptor = getInternal('Registries/Interceptors').each,
        interceptionInfoCache = {},
        Interception;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Interception = {
        /**
         * @param {string} subjectName
         *
         * @return {boolean}
         */
        isInterception: function(subjectName) {
            return Interception.getSubjectName(subjectName) !== subjectName;
        },
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        getSubjectName: function(subjectName) {
            return Interception.getInfo(subjectName).name;
        },
        /**
         * @param {string} subjectName
         * @param {JARS~internals.Resolvers.Interception~Info} info
         *
         * @return {string}
         */
        makeInterception: function(subjectName, info) {
            return info.type ? subjectName + info.type + info.data : subjectName;
        },
        /**
         * @param {string} subjectName
         *
         * @return {JARS~internals.Resolvers.Interception~Info}
         */
        getInfo: function(subjectName) {
            var interceptionInfo = interceptionInfoCache[subjectName],
                moduleParts;

            if (!interceptionInfo) {
                eachInterceptor(function findInterceptor(interceptor, interceptorType) {
                    if (subjectName.indexOf(interceptorType) > -1) {
                        moduleParts = subjectName.split(interceptorType);

                        interceptionInfo = {
                            name: moduleParts.shift(),

                            type: interceptorType,

                            data: moduleParts.join(interceptorType)
                        };
                    }

                    return !!interceptionInfo;
                });

                interceptionInfo = interceptionInfoCache[subjectName] = interceptionInfo || {
                    name: subjectName
                };
            }

            return interceptionInfo;
        }
    };

    /**
     * @typedef {Object} Info
     *
     * @memberof JARS~internals.Resolvers.Interception
     * @inner
     *
     * @property {string} name
     * @property {string} type
     * @property {string} data
     */

    return Interception;
});
