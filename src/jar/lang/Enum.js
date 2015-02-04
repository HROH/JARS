JAR.module('jar.lang.Enum').$import([
    {
        System: [
            '::isArray',
            '::isObject'
        ]
    },
    '.Array!iterate',
    '.Object!iterate',
    '.Class'
]).$export(function(isArray, isObject, Arr, Obj, Class) {
    'use strict';

    var BASE_TWO = 2,
        Enum;

    Enum = Class('Enum', {
        $: {
            construct: function(enums, options) {
                options = options || {};

                if (isArray(enums)) {
                    enums = Arr.reduce(enums, function aggregateEnums(enumsObject, key, index) {
                        enumsObject[key] = options.bitSteps ? Math.pow(BASE_TWO, index) : options.mirror ? key : index;

                        return enumsObject;
                    }, {});
                }

                if (isObject(enums)) {
                    Obj.each(enums, addKeyToEnum, this);

                    this._$enums = enums;
                }
            },

            values: function() {
                return Obj.copy(this._$enums);
            },

            contains: function(key) {
                return Obj.hasOwn(this._$enums, key);
            }
        },

        _$: {
            enums: null
        }
    });

    function addKeyToEnum(value, key) {
        /*jslint validthis: true */
        this[key] = value;
    }

    return Enum;
});