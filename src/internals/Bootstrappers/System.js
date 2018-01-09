JARS.internal('Bootstrappers/System', function(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Bootstrappers
     */
    var System = {
        /**
         * @method
         */
        bootstrap: function() {
            var systemModule;

            getInternal('Configs/Global').update('modules', {
                restrict: 'System.*',

                basePath: getInternal('Env').INTERNALS_PATH
            });

            systemModule = getInternal('Registries/Modules').register('System', [
                'Formatter',
                'Logger',
                'LogContext',
                'LogLevels',
                'Modules',
                'Transports.*'
            ]);

            /**
             * @module System
             *
             * @borrows JARS~internals.Registries.Internals as $$internals
             * @borrows JARS~internals.Types.Validators.getType as getType
             * @borrows JARS~internals.Types.Validators.isNil as isNil
             * @borrows JARS~internals.Types.Validators.isNull as isNull
             * @borrows JARS~internals.Types.Validators.isUndefined as isUndefined
             * @borrows JARS~internals.Types.Validators.isString as isString
             * @borrows JARS~internals.Types.Validators.isNumber as isNumber
             * @borrows JARS~internals.Types.Validators.isBoolean as isBoolean
             * @borrows JARS~internals.Types.Validators.isArray as isArray
             * @borrows JARS~internals.Types.Validators.isObject as isObject
             * @borrows JARS~internals.Types.Validators.isFunction as isFunction
             * @borrows JARS~internals.Types.Validators.isDate as isDate
             * @borrows JARS~internals.Types.Validators.isRegExp as isRegExp
             */
            systemModule.setMeta({
                /**
                 * @param {JARS~internals.Subjects.Interception} pluginRequest
                 */
                plugIn: function(pluginRequest) {
                    pluginRequest.success(pluginRequest.requestor.config.get('config'));
                }
            });

            systemModule.$export(function() {
                var Validators = getInternal('Types/Validators'),
                    envGlobal = getInternal('Env').global,
                    System;

                System = {
                    /**
                     * @namespace
                     *
                     * @memberof module:System
                     */
                    env: {
                        /**
                         * @type {Global}
                         */
                        global: envGlobal
                    },

                    $$internals: getInternal('Registries/Internals'),
                    /**
                     * @memberof module:System
                     *
                     * @param {string} typeDef
                     */
                    addTypeValidator: function(typeDef) {
                        var validatorName = Validators.add(typeDef);

                        System[validatorName] || (System[validatorName] = Validators[validatorName]);
                    },
                    /**
                     * @memberof module:System
                     *
                     * @param {*} value
                     *
                     * @return {boolean}
                     */
                    isArrayLike: function(value) {
                        return System.isArray(value) || (!System.isNil(value) && isIterable(value));
                    },
                    /**
                     * @memberof module:System
                     *
                     * @param {*} value
                     *
                     * @return {boolean}
                     */
                    isArguments: function(value) {
                        return value && (Validators.isArguments(value) || System.isArrayLike(value));
                    },
                    /**
                     * @memberof module:System
                     *
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
                     * @memberof module:System
                     *
                     * @param {*} value
                     *
                     * @return {boolean}
                     */
                    isInteger: Number.isInteger || function(value) {
                        return System.isNumber(value) && envGlobal.parseInt(value, 10) === value;
                    },
                    /**
                     * @memberof module:System
                     *
                     * @param {*} value
                     *
                     * @return {boolean}
                     */
                    isNaN: function(value) {
                        return envGlobal.isNaN(value) && value !== value;
                    },
                    /**
                     * @memberof module:System
                     *
                     * @param {*} instance
                     * @param {Function} Class
                     *
                     * @return {boolean}
                     */
                    isA: function(instance, Class) {
                        return instance instanceof Class;
                    },

                    getType: Validators.getType,

                    isNil: Validators.isNil,

                    isNull: Validators.isNull,

                    isUndefined: Validators.isUndefined,

                    isString: Validators.isString,

                    isNumber: Validators.isNumber,

                    isBoolean: Validators.isBoolean,

                    isArray: Validators.isArray,

                    isObject: Validators.isObject,

                    isFunction: Validators.isFunction,

                    isDate: Validators.isDate,

                    isRegExp: Validators.isRegExp
                };

                /**
                 * @memberof module:System
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
        }
    };

    return System;
});
