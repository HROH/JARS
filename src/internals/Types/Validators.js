JARS.internal('Types/Validators', function(getInternal) {
    'use strict';

    var envGlobal = getInternal('Env').global,
        TypeLookup = getInternal('Types/Lookup'),
        Validators,
        VALIDATOR_PREFIX = 'is',
        ARGUMENTS = 'arguments';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Types
     */
    Validators = {
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isNil: function(value) {
            return Validators.isUndefined(value) || Validators.isNull(value);
        },
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isDefined: function(value) {
            return !Validators.isUndefined(value);
        },
        /**
         * @method
         *
         * @param {*} value
         *
         * @return {boolean}
         */
        isInteger: Number.isInteger || function(value) {
            return Validators.isNumber(value) && envGlobal.parseInt(value, 10) === value;
        },
        /**
         * @method
         *
         * @param {*} value
         *
         * @return {boolean}
         */
        isFinite: envGlobal.isFinite,
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isNaN: function(value) {
            return envGlobal.isNaN(value) && value !== value;
        },
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isArrayLike: function(value) {
            return Validators.isArray(value) || (!Validators.isNil(value) && isIterable(value));
        },
        /**
         * @param {*} instance
         * @param {Function} Class
         *
         * @return {boolean}
         */
        isA: function(instance, Class) {
            return instance instanceof Class;
        }
    };

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

    /**
     * @memberof JARS~internals.Types.Validators
     * @inner
     *
     * @param {*} value
     *
     * @return {boolean}
     */
    function isIterable(value) {
        var length = value.length;

        return length === 0 || (length > 0 && ((length - 1) in value));
    }

    TypeLookup.each(function(type, typeDef) {
        var validatorName = VALIDATOR_PREFIX + typeDef;

        Validators[validatorName] = getGlobalValidator(typeDef, validatorName) || (type === ARGUMENTS ? function(value) {
            return value && (TypeLookup.get(value) === type || Validators.isArrayLike(value));
        } : function(value) {
            return TypeLookup.get(value) === type;
        });
    });

    function getGlobalValidator(typeDef, validatorName) {
        return (envGlobal[typeDef] && envGlobal[typeDef][validatorName]) ? envGlobal[typeDef][validatorName] : null;
    }

    return Validators;
});
