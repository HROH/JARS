JARS.internal('Types/Lookup', function(getInternal) {
    'use strict';

    var envGlobal = getInternal('Env').global,
        typeLookup = {},
        toString = ({}).toString,
        TYPE_LOOKUP_PREFIX = '[object ',
        TYPE_LOOKUP_SUFFIX = ']',
        NOTHING = null,
        INFINITY = 'infinity',
        NAN = 'nan',
        NUMBER = 'number',
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
            var type = (value === NOTHING ? String(value) : typeLookup[toString.call(value)]) || typeof value;

            return type === NUMBER ? getNumberType(value) : type;
        }
    };

    /**
     * @memberof JARS~internals.Types.Lookup
     * @inner
     *
     * @param {*} value
     *
     * @return {string}
     */
    function getNumberType(value) {
        return envGlobal.isNaN(value) ? NAN : envGlobal.isFinite(value) ? NUMBER : INFINITY;
    }

    return Lookup;
});
