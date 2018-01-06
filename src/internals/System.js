JARS.internal('System', function(getInternal) {
    'use strict';

    var Type = getInternal('Type'),
        arrayEach = getInternal('Utils').arrayEach,
        envGlobal = getInternal('Env').global,
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
        isArgs, System;

    /**
     * @namespace
     *
     * @memberof JARS~internals
     */
    System = {
        /**
         * @type {Object}
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
         *
         * @return {JARS~internals.System~TypeValidator}
         */
        addTypeValidator: function(typeDef) {
            var typeValidator = Type.add(typeDef);

            System[typeValidator.name] = typeValidator.fn;
        },
        /**
         * @param {*} value
         *
         * @return {string}
         */
        getType: Type.get,
        /**
         * @member {JARS~internals.System~TypeValidator}
         */
        isNil: Type.isNil,
        /**
         * @member {JARS~internals.System~TypeValidator}
         */
        isArrayLike: function(value) {
            return System.isArray(value) || (!System.isNil(value) && isIterable(value));
        },
        /**
         * @member {JARS~internals.System~TypeValidator}
         */
        isDefined: function(value) {
            return !System.isUndefined(value);
        },
        /**
         * @member {JARS~internals.System~TypeValidator}
         */
        isInteger: Number.isInteger || function(value) {
            return System.isNumber(value) && envGlobal.parseInt(value, 10) === value;
        },
        /**
         * @member {JARS~internals.System~TypeValidator}
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
     * @name JARS~internals.System.isNull
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isUndefined
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isString
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isNumber
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isBoolean
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isArray
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isObject
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isFunction
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isDate
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @name JARS~internals.System.isRegExp
     * @type {JARS~internals.System~TypeValidator}
     */

    /**
     * @typedef {function} JARS~internals.System~TypeValidator
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    arrayEach(types, System.addTypeValidator);

    isArgs = System.isArguments;

    /**
     * @member {JARS~internals.System~TypeValidator}
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
