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

            systemModule = getInternal('Registries/Subjects').registerModule('System', [
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
             * @borrows JARS~internals.Types.Lookup.get as getType
             * @borrows JARS~internals.Types.Validators.isNil as isNil
             * @borrows JARS~internals.Types.Validators.isNull as isNull
             * @borrows JARS~internals.Types.Validators.isUndefined as isUndefined
             * @borrows JARS~internals.Types.Validators.isDefined as isDefined
             * @borrows JARS~internals.Types.Validators.isString as isString
             * @borrows JARS~internals.Types.Validators.isNumber as isNumber
             * @borrows JARS~internals.Types.Validators.isInteger as isInteger
             * @borrows JARS~internals.Types.Validators.isFinite as isFinite
             * @borrows JARS~internals.Types.Validators.isNaN as isNaN
             * @borrows JARS~internals.Types.Validators.isBoolean as isBoolean
             * @borrows JARS~internals.Types.Validators.isArray as isArray
             * @borrows JARS~internals.Types.Validators.isArrayLike as isArrayLike
             * @borrows JARS~internals.Types.Validators.isArguments as isArguments
             * @borrows JARS~internals.Types.Validators.isObject as isObject
             * @borrows JARS~internals.Types.Validators.isFunction as isFunction
             * @borrows JARS~internals.Types.Validators.isDate as isDate
             * @borrows JARS~internals.Types.Validators.isRegExp as isRegExp
             * @borrows JARS~internals.Types.Validators.isA as isA
             */
            systemModule.setMeta({
                /**
                 * @param {JARS~internals.Subjects.Interception} pluginRequest
                 */
                plugIn: function(pluginRequest) {
                    pluginRequest.$export(function() {
                        return pluginRequest.requestor.config.get('config');
                    });
                }
            });

            systemModule.$export(function() {
                var Validators = getInternal('Types/Validators'),
                    Lookup = getInternal('Types/Lookup'),
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

                    getType: Lookup.getType,

                    isNil: Validators.isNil,

                    isNull: Validators.isNull,

                    isUndefined: Validators.isUndefined,

                    isDefined: Validators.isDefined,

                    isString: Validators.isString,

                    isNumber: Validators.isNumber,

                    isInteger: Validators.isInteger,

                    isFinite: Validators.isFinite,

                    isNaN: Validators.isNaN,

                    isBoolean: Validators.isBoolean,

                    isArray: Validators.isArray,

                    isArrayLike: Validators.isArrayLike,

                    isArguments: Validators.isArguments,

                    isObject: Validators.isObject,

                    isFunction: Validators.isFunction,

                    isDate: Validators.isDate,

                    isRegExp: Validators.isRegExp,

                    isA: Validators.isA
                };

                return System;
            });
        }
    };

    return System;
});
