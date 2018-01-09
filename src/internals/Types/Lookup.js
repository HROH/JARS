JARS.internal('Types/Lookup', function() {
    'use strict';

    var typeLookup = {},
        toString = ({}).toString,
        TYPE_LOOKUP_PREFIX = '[object ',
        TYPE_LOOKUP_SUFFIX = ']',
        Lookup;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Types
     */
    Lookup = {
        /**
         * @param {string} typeDef
         *
         * @return {string}
         */
        add: function(typeDef) {
            return (typeLookup[TYPE_LOOKUP_PREFIX + typeDef + TYPE_LOOKUP_SUFFIX] = typeDef.toLowerCase());
        },
        /**
         * @param {*} value
         *
         * @return {string}
         */
        get: function(value) {
            return typeLookup[toString.call(value)];
        }
    };

    return Lookup;
});
