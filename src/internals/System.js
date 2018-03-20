JARS.module('System', [
    'Formatter',
    'Logger',
    'LogContext',
    'LogLevels',
    'Modules',
    'Transports.*'
]).$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var Validators = InternalsRegistry.get('Types/Validators'),
        Lookup = InternalsRegistry.get('Types/Lookup'),
        envGlobal = InternalsRegistry.get('Env').global,
        merge = InternalsRegistry.get('Helpers/Object').merge,
        System;

    /**
     * @module System
     *
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
    System = merge({
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

        getType: Lookup.get
    }, Validators);

    return System;
});
