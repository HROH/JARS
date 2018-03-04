JARS.internal('Helpers/Cache', function(getInternal) {
    'use strict';

    var isInterception = getInternal('Resolvers/Interception').isInterception,
        each = getInternal('Helpers/Object').each,
        cache = {},
        Cache;
    
    /**
     * @namespace
     *
     * @memberof JARS~internals.Helpers
     */
    Cache = {
        /**
         * @param {string} subjectName
         * @param {string} key
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {*}
         */
        get: function(subjectName, key, requestor) {
            var entry = cache[subjectName] = cache[subjectName] || {};
            
            if(requestor) {
                entry = entry[requestor.name] = entry[requestor.name] || {};
            }

            return entry[key];
        },
        /**
         * @param {string} subjectName
         * @param {string} key
         * @param {*} value
         * @param {JARS~internals.Subjects.Subject} [requestor]
         *
         * @return {*}
         */
        set: function(subjectName, key, value, requestor) {
            var entry = cache[subjectName];
            
            if(requestor) {
                entry = entry[requestor.name];
            }
            
            entry[key] = value;

            return value;
        },
        /**
         * @param {function((JARS~internals.Subjects.Subject|null))} callback
         */
        each: function(callback) {
            each(cache, function(entry, subjectName) {
                if(isInterception(subjectName)) {
                    each(entry, function(interceptionEntry) {
                        interceptionEntry.subject && callback(interceptionEntry.subject);
                    });
                }
                else {
                    entry.subject && callback(entry.subject);
                }
            });
        }
    };

    return Cache;
});
