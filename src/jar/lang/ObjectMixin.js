JAR.module('jar.lang.ObjectMixin').$import([
    {
        System: [
            '::isArray',
            'Logger'
        ],
        '.Class': [
            '.',
            '::isClass',
            '::isInstance'
        ]
    },
    'jar::getCurrentModuleData',
    '.Object',
    '.Array!check,derive,iterate',
    '.Function!modargs'
]).$export(function(isArray, Logger, Class, isClass, isInstance, getCurrentModuleData, Obj, Arr) {
    'use strict';

    var RECEIVER_MISSING = 0,
        RECEIVER_NOT_ALLOWED = 1,
        mixinTemplates = [],
        ObjectMixin;

    mixinTemplates[RECEIVER_MISSING] = 'There is no receiver given!';
    mixinTemplates[RECEIVER_NOT_ALLOWED] = 'The given receiver "${rec}" is not part or instance of the allowed Classes!';

    ObjectMixin = Class('ObjectMixin', {
        $: {
            construct: function(mixinName, toMix, options) {
                options = options || {};

                this._$name = mixinName;
                this._$toMix = Obj.from(toMix);
                this._$neededMixins = Arr.filter(options.depends || [], ObjectMixin.isInstance, ObjectMixin);
                this._$logger = new Logger(this.Class.getClassName() + ' "#<' + getCurrentModuleData().moduleName + ':' + mixinName + '>"', {
                    tpl: mixinTemplates
                });
            },

            mixInto: function(receiver) {
                var logger = this._$logger,
                    toMix = this._$toMix;

                if (receiver) {
                    if (this._$neededMixins.length) {
                        this._$neededMixins.each(mixIntoReceiver, receiver);
                    }

                    Obj.extend(receiver, toMix);
                }
                else {
                    logger.warn(RECEIVER_MISSING);
                }

                return receiver;
            },

            getName: function() {
                return this._$name;
            }
        },

        _$: {
            name: '',

            logger: null,

            toMix: null,

            neededMixins: null
        }
    });

    function mixIntoReceiver(mixin) {
        /*jslint validthis: true */
        mixin.mixInto(this);
    }

    return ObjectMixin;
});