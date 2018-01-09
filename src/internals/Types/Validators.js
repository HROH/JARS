JARS.internal('Types/Validators', function(getInternal) {
    'use strict';

    var envGlobal = getInternal('Env').global,
        TypeLookup = getInternal('Types/Lookup'),
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
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
         * @return {string}
         */
        add: function(typeDef) {
            var validatorName = VALIDATOR_PREFIX + typeDef;

            Validators[validatorName] || createValidator(validatorName, TypeLookup.add(typeDef), envGlobal[typeDef]);

            return validatorName;
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
     */
    function createValidator(validatorName, type, globalType) {
        Validators[validatorName] = (globalType && globalType[validatorName]) || function typeValidator(value) {
            return Validators.is(type, value);
        };
    }

    /**
     * @method JARS~internals.Types.Validators.isNull
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isUndefined
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isString
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isNumber
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isBoolean
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isArray
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isArguments
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isObject
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isFunction
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isDate
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.Types.Validators.isRegExp
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    getInternal('Helpers/Array').each(types, function(typeDef) {
        Validators.add(typeDef);
    });

    return Validators;
});
