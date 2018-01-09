JARS.internal('Types/Validators', function(getInternal) {
    'use strict';

    var envGlobal = getInternal('Env').global,
        TypeLookup = getInternal('Types/Lookup'),
        NOTHING = null,
        VALIDATOR_PREFIX = 'is',
        INFINITY = 'infinity',
        NAN = 'nan',
        NUMBER = 'number',
        Validators;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Types
     */
    Validators = {
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
        getType: function(value) {
            var type;

            if (!Validators.isNil(value)) {
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
            return Validators.getType(value) === type.toLowerCase();
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
     * @memberof JARS~internals.Types.Validators
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
     * @memberof JARS~internals.Types.Validators
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
                return Validators.is(type, value);
            }
        };
    }

    return Validators;
});
