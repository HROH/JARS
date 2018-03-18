JARS.internal('Types/Lookup', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Object').each,
        envGlobal = getInternal('Env').global,
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
        typeDefs = {},
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
         * @param {*} value
         *
         * @return {string}
         */
        get: function(value) {
            var type = (value == NOTHING ? String(value) : typeLookup[toString.call(value)]) || typeof value;

            return type === NUMBER ? getNumberType(value) : type;
        },

        each: function(callback) {
            each(typeDefs, callback);
        }
    };

    getInternal('Helpers/Array').each(types, function(typeDef) {
        typeDefs[typeDef] = typeLookup[TYPE_LOOKUP_PREFIX + typeDef + TYPE_LOOKUP_SUFFIX] = typeDef.toLowerCase();
    });

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
