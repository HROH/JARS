JARS.internal('Resolvers/Subjects/Interception', function(getInternal) {
    'use strict';

    var unwrapVersion = getInternal('Resolvers/Version').unwrapVersion,
        eachInterceptor = getInternal('Registries/Interceptors').each,
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
         * @param {JARS~internals.Resolvers.Subjects~Info} info
         *
         * @return {string}
         */
        getName: function(subjectName, info) {
            return unwrapVersion(function(tmpSubjectName) {
                return tmpSubjectName && info && info.type ? tmpSubjectName + info.type + info.data : tmpSubjectName;
            })(subjectName);
        },
        /**
         * @param {string} subjectName
         *
         * @return {string}
         */
        getParentName: unwrapVersion(function(subjectName) {
            return Interception.getInfo(subjectName).name;
        }),
        /**
         * @param {string} subjectName
         *
         * @return {JARS~internals.Resolvers.Subjects~Info}
         */
        getInfo: function(subjectName) {
            var interceptionInfo = interceptionInfoCache[subjectName],
                subjectParts;

            if (!interceptionInfo) {
                eachInterceptor(function findInterceptor(interceptor, interceptorType) {
                    if (subjectName.indexOf(interceptorType) > -1) {
                        subjectParts = subjectName.split(interceptorType);

                        interceptionInfo = {
                            name: subjectParts.shift(),

                            type: interceptorType,

                            data: subjectParts.join(interceptorType)
                        };
                    }

                    return !!interceptionInfo;
                });

                interceptionInfo = interceptionInfoCache[subjectName] = interceptionInfo || {
                    name: subjectName
                };
            }

            return interceptionInfo;
        },
        /**
         * @param {function(string): string} transformSubjectName
         *
         * @return {function(string): string}
         */
        unwrapInterception: function(transformSubjectName) {
            return function(subjectName) {
                var info = Interception.getInfo(subjectName);

                return Interception.getName(transformSubjectName(info.name), info);
            };
        }
    };

    return Interception;
});
