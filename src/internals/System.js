JARS.internal('System', function systemSetup(InternalsManager) {
    'use strict';

    var Utils = InternalsManager.get('Utils'),
        hasOwnProp = Utils.hasOwnProp,
        envGlobal = (1,eval)('this'), // jshint ignore:line
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
        RE_TEMPLATE_KEY = /\$\{(.*?)\}/g,
        UNKNOWN_KEY = '<UNKNOWN KEY>',
        NOTHING = null,
        typeLookup = {},
        toString = ({}).toString,
        isArgs, System;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    System = {
        env: {
            /**
             * @type Global
             */
            global: envGlobal
        },

        $$internals: InternalsManager,
        /**
         * @param {string} typeDef
         *
         * @return {JARS.internals.System.TypeValidator}
         */
        addTypeValidator: function(typeDef) {
            var validatorName = 'is' + typeDef,
                nativeTypeValidator = envGlobal[typeDef] && envGlobal[typeDef][validatorName];

            typeLookup['[object ' + typeDef + ']'] = typeDef = typeDef.toLowerCase();

            System[validatorName] = nativeTypeValidator || function typeValidator(value) {
                return System.getType(value) === typeDef;
            };
        },
        /**
         * @param {*} value
         *
         * @return {string}
         */
        getType: function getType(value) {
            var type;

            if (!System.isNil(value)) {
                if (isElement(value)) {
                    type = 'element';
                }
                else {
                    type = typeLookup[toString.call(value)];

                    if (type === 'number') {
                        type = getTypeOfNumber(value);
                    }
                }
            }
            else {
                type = String(value);
            }

            return type || typeof value;
        },
        /**
         * @member {JARS.internals.System.TypeValidator}
         */
        isNil: function(value) {
            return value == NOTHING;
        },
        /**
         * @member {JARS.internals.System.TypeValidator}
         */
        isArrayLike: function(value) {
            var isArrayLike = false,
                length;

            if (value) {
                length = value.length;

                isArrayLike = System.isArray(value) || (System.isNumber(length) && length === 0 || (length > 0 && ((length - 1) in value)));
            }

            return isArrayLike;
        },
        /**
         * @member {JARS.internals.System.TypeValidator}
         */
        isDefined: function(value) {
            return !System.isUndefined(value);
        },
        /**
         * @member {JARS.internals.System.TypeValidator}
         */
        isInteger: Number.isInteger || function(value) {
            return System.isNumber(value) && parseInt(value, 10) === value;
        },
        /**
         * @member {JARS.internals.System.TypeValidator}
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
        },
        /**
         * @param {string} message
         * @param {(Object<string, string>|string[])} data
         *
         * @return {string}
         */
        format: function(message, data) {
            if (System.isString(message) && (System.isObject(data) || System.isArray(data))) {
                formatReplace.data = data;

                message = message.replace(RE_TEMPLATE_KEY, formatReplace);

                formatReplace.data = null;
            }

            return message;
        },
        /**
         * @param {JARS.internals.Interception} pluginRequest
         */
        $plugIn: function(pluginRequest) {
            pluginRequest.success(pluginRequest.listeningModule.config.get('config'));
        }
    };

    /**
     * @name JARS.internals.System.isNull
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isUndefined
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isString
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isNumber
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isBoolean
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isArray
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isObject
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isFunction
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isDate
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @name JARS.internals.System.isRegExp
     * @type {JARS.internals.System.TypeValidator}
     */

    /**
     * @typedef {function} JARS.internals.System.TypeValidator
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    Utils.arrayEach(types, System.addTypeValidator);

    isArgs = System.isArguments;

    /**
     * @member {JARS.internals.System.TypeValidator}
     */
    System.isArguments = function(value) {
        return value && (isArgs(value) || System.isArrayLike(value));
    };

    /**
     * @member {JARS.internals.System.TypeValidator}
     *
     * @memberof JARS.internals.System
     * @inner
     */
    function isElement(value) {
        return value.nodeType === 1 || value.nodeType === 9;
    }

    /**
     * @memberof JARS.internals.System
     * @inner
     *
     * @param {*} value
     *
     * @return {string}
     */
    function getTypeOfNumber(value) {
        var type = 'number';

        if (isNaN(value)) {
            type = 'nan';
        }
        else if (!isFinite(value)) {
            type = 'infinity';
        }

        return type;
    }

    /**
     * @memberof JARS.internals.System
     * @inner
     *
     * @param {Array} match
     * @param {string} key
     *
     * @return {string}
     */
    function formatReplace(match, key) {
        var data = formatReplace.data;

        return hasOwnProp(data, key) ? data[key] : UNKNOWN_KEY;
    }

    return System;
});
