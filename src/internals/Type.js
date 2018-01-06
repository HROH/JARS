JARS.internal('Type', function(getInternal) {
    'use strict';

    var envGlobal = getInternal('Env').global,
        TypeLookup = getInternal('TypeLookup'),
        NOTHING = null,
        VALIDATOR_PREFIX = 'is',
        INFINITY = 'infinity',
        NAN = 'nan',
        NUMBER = 'number',
        Type;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     */
    Type = {
        /**
         * @param {string} typeDef
         *
         * @return {Object}
         */
        add: function(typeDef) {
            return createValidator(VALIDATOR_PREFIX + typeDef, TypeLookup.add(typeDef), envGlobal[typeDef]);
        },
        /**
         * @param {*} value
         *
         * @return {string}
         */
        get: function(value) {
            var type;

            if (!Type.isNil(value)) {
                type = TypeLookup.get(value);

                if (type === NUMBER) {
                    type = getTypeOfNumber(value);
                }
            }
            else {
                type = String(value);
            }

            return type || typeof value;
        },
        /**
         * @param {string} type
         * @param {*} value
         *
         * @return {boolean}
         */
        is: function(type, value) {
            return Type.get(value) === type.toLowerCase();
        },
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isNil: function(value) {
            return value == NOTHING;
        }
    };

    /**
     * @memberof JARS~internals.Type
     * @inner
     *
     * @param {*} value
     *
     * @return {string}
     */
    function getTypeOfNumber(value) {
        return envGlobal.isNaN(value) ? NAN : envGlobal.isFinite(value) ? NUMBER : INFINITY;
    }

    /**
     * @memberof JARS~internals.Type
     * @inner
     *
     * @param {string} validatorName
     * @param {string} type
     * @param {Object} globalType
     *
     * @return {Object}
     */
    function createValidator(validatorName, type, globalType) {
        return {
            name: validatorName,

            fn: (globalType && globalType[validatorName]) || function typeValidator(value) {
                return Type.is(type, value);
            }
        };
    }

    return Type;
});
