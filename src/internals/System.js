JARS.internal('System', function systemSetup(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        envGlobal = utils.global,
        hasOwnProp = utils.hasOwnProp,
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
        RE_TEMPLATE_KEY = /\$\{(.*?)\}/g,
        UNKNOWN_KEY = '<UNKNOWN KEY>',
        NOTHING = null,
        typeLookup = {},
        toString = ({}).toString,
        isArgs, System;

    /**
     * @exports System
     *
     * @access public
     *
     * @namespace System
     */
    System = {
        env: {
            global: envGlobal
        },

        $$internals: InternalsManager,
        /**
         * @access public
         *
         * @memberof System
         *
         * @param {*} value
         *
         * @return {String}
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
         * @access public
         *
         * @memberof System
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        isNil: function(value) {
            return value == NOTHING;
        },
        /**
         * @access public
         *
         * @memberof System
         *
         * @param {*} value
         *
         * @return {Boolean}
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
         * @access public
         *
         * @memberof System
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        isDefined: function(value) {
            return !System.isUndefined(value);
        },
        /**
         * @access public
         *
         * @function
         * @memberof System
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        isInteger: Number.isInteger || function(value) {
            return System.isNumber(value) && parseInt(value, 10) === value;
        },
        /**
         * @access public
         *
         * @memberof System
         *
         * @param {*} value
         *
         * @return {Boolean}
         */
        isNaN: function(value) {
            return envGlobal.isNaN(value) && value !== value;
        },
        /**
         * @access public
         *
         * @memberof System
         *
         * @param {*} instance
         * @param {Function} Class
         *
         * @return {Boolean}
         */
        isA: function(instance, Class) {
            return instance instanceof Class;
        },
        /**
         * @access public
         *
         * @memberof System
         *
         * @param {String} message
         * @param {(Object<String, String>|String[])} data
         *
         * @return {String}
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
         * @access public
         *
         * @memberof System
         *
         * @param {JARS~Interception} pluginRequest
         */
        $plugIn: function(pluginRequest) {
            pluginRequest.success(pluginRequest.listeningModule.config.get('config'));
        }
    };

    /**
     * @access public
     *
     * @function isNull
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isUndefined
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isString
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isNumber
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isBoolean
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isArray
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isObject
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isFunction
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isDate
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access public
     *
     * @function isRegExp
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */

    /**
     * @access private
     *
     * @memberof System
     * @inner
     *
     * @param {String} typeDef
     *
     * @return {Function(*):boolean}
     */
    function typeValidatorSetup(typeDef) {
        var nativeTypeValidator = envGlobal[typeDef] && envGlobal[typeDef]['is' + typeDef];

        typeLookup['[object ' + typeDef + ']'] = typeDef = typeDef.toLowerCase();

        return nativeTypeValidator || function typeValidator(value) {
            return System.getType(value) === typeDef;
        };
    }

    utils.arrayEach(types, function createTypeValidator(type) {
        System['is' + type] = typeValidatorSetup(type);
    });

    isArgs = System.isArguments;

    /**
     * @access public
     *
     * @memberof System
     *
     * @param {*} value
     *
     * @return {Boolean}
     */
    System.isArguments = function(value) {
        return value && (isArgs(value) || System.isArrayLike(value));
    };

    /**
     * @access private
     *
     * @memberof System
     * @inner
     *
     * @param {*} value
     *
     * @return {Boolean}
     */
    function isElement(value) {
        return value.nodeType === 1 || value.nodeType === 9;
    }

    /**
     * @access private
     *
     * @memberof System
     * @inner
     *
     * @param {*} value
     *
     * @return {String}
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
     * @access private
     *
     * @memberof System
     * @inner
     *
     * @param {Array} match
     * @param {String} key
     *
     * @return {String}
     */
    function formatReplace(match, key) {
        var data = formatReplace.data;

        return hasOwnProp(data, key) ? data[key] : UNKNOWN_KEY;
    }

    return System;
});
