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
         * @param {*} value
         *
         * @return {boolean}
         */
        isNil: function(value) {
            return value == NOTHING;
        },
        /**
         * @param {*} value
         *
         * @return {boolean}
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
            return System.isNumber(value) && parseInt(value, 10) === value;
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
     * @function isNull
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isUndefined
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isString
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isNumber
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isBoolean
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isArray
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isObject
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isFunction
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isDate
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @function isRegExp
     * @memberof JARS.internals.System
     *
     * @param {*} value
     *
     * @return {boolean}
     */

    /**
     * @memberof JARS.internals.System
     * @inner
     *
     * @param {string} typeDef
     *
     * @return {function(*):boolean}
     */
    function typeValidatorSetup(typeDef) {
        var nativeTypeValidator = envGlobal[typeDef] && envGlobal[typeDef]['is' + typeDef];

        typeLookup['[object ' + typeDef + ']'] = typeDef = typeDef.toLowerCase();

        return nativeTypeValidator || function typeValidator(value) {
            return System.getType(value) === typeDef;
        };
    }

    Utils.arrayEach(types, function createTypeValidator(type) {
        System['is' + type] = typeValidatorSetup(type);
    });

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
     * @memberof JARS.internals.System
     * @inner
     *
     * @param {*} value
     *
     * @return {boolean}
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
