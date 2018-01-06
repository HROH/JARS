JARS.internal('System', function(getInternal) {
    'use strict';

    var Type = getInternal('Type'),
        envGlobal = getInternal('Env').global,
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
        isArgs, System;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     *
     * @borrows JARS~internals.Type.get as getType
     * @borrows JARS~internals.Type.isNil as isNil
     */
    System = {
        /**
         * @namespace
         */
        env: {
            /**
             * @type {Global}
             */
            global: envGlobal
        },

        $$internals: getInternal('Registries/Internals'),
        /**
         * @param {string} typeDef
         */
        addTypeValidator: function(typeDef) {
            var typeValidator = Type.add(typeDef);

            System[typeValidator.name] = typeValidator.fn;
        },

        getType: Type.get,

        isNil: Type.isNil,
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isArrayLike: function(value) {
            return System.isArray(value) || (!System.isNil(value) && isIterable(value));
        },
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isDefined: function(value) {
            return !System.isUndefined(value);
        },
        /**
         * @method
         *
         * @param {*} value
         *
         * @return {boolean}
         */
        isInteger: Number.isInteger || function(value) {
            return System.isNumber(value) && envGlobal.parseInt(value, 10) === value;
        },
        /**
         * @param {*} value
         *
         * @return {boolean}
         */
        isNaN: function(value) {
            return envGlobal.isNaN(value) && value !== value;
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
     * @method JARS~internals.System.isNull
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isUndefined
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isString
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isNumber
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isBoolean
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isArray
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isObject
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isFunction
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isDate
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.System.isRegExp
     *
     * @param {*} value
     *
     * @return {boolean}
     */


    getInternal('Helpers/Array').each(types, System.addTypeValidator);

    isArgs = System.isArguments;

    /**
     * @param {*} value
     *
     * @return {boolean}
     */
    System.isArguments = function(value) {
        return value && (isArgs(value) || System.isArrayLike(value));
    };

    /**
     * @memberof JARS~internals.System
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

    return System;
});
