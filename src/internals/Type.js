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

    Type = {
        add: function(typeDef) {
            return createValidator(VALIDATOR_PREFIX + typeDef, TypeLookup.add(typeDef), envGlobal[typeDef]);
        },

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

        is: function(type, value) {
            return Type.get(value) === type.toLowerCase();
        },

        isNil: function(value) {
            return value == NOTHING;
        }
    };

    /**
     * @memberof JARS.internals.Type
     * @inner
     *
     * @param {*} value
     *
     * @return {string}
     */
    function getTypeOfNumber(value) {
        return envGlobal.isNaN(value) ? NAN : envGlobal.isFinite(value) ? NUMBER : INFINITY;
    }

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
