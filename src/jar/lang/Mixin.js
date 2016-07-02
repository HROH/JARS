JAR.module('jar.lang.Mixin').$import([
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
    '.ObjectMixin',
    '.Object',
    '.Array!check,derive,iterate',
    '.Function!modargs'
]).$export(function(isArray, Logger, Class, isClass, isInstance, getCurrentModuleData, ObjectMixin, Obj, Arr, Fn) {
    'use strict';

    var RECEIVER_MISSING = 0,
        RECEIVER_NOT_ALLOWED = 1,
        mixinTemplates = [],
        Mixin;

    mixinTemplates[RECEIVER_MISSING] = 'There is no receiver given!';
    mixinTemplates[RECEIVER_NOT_ALLOWED] = 'The given receiver "${rec}" is not part or instance of the allowed Classes!';

    Mixin = Class('Mixin', {
        $: {
            construct: function(mixinName, toMix, options) {
                var allowedClasses;

                options = options || {};
                
                this.$super(mixinName, toMix, options);

                allowedClasses = options.classes;

                this._$allowedClasses = Arr.filter(isArray(allowedClasses) ? allowedClasses : [allowedClasses], isClass);
                this._$destructor = options.destructor;
            },

            mixInto: function(receiver) {
                var logger = this._$logger,
                    isReceiverAllowedForMixin = Fn.partial(isReceiverAllowed, receiver),
                    toMix = this._$toMix,
                    allowedClasses = this._$allowedClasses,
                    destructor = this._$destructor,
                    objectToExtend;

                if (receiver) {
                    if (this._$neededMixins.length) {
                        this._$neededMixins.each(mixIntoReceiver, receiver);
                    }

                    if (Arr.every(allowedClasses, isReceiverAllowedForMixin)) {
                        if (isClass(receiver)) {
                            objectToExtend = receiver.prototype;
                            receiver.addDestructor(destructor);
                        }
                        else {
                            objectToExtend = receiver;

                            if (isInstance(receiver)) {
                                receiver.Class.addDestructor(destructor, receiver);
                            }
                        }

                        objectToExtend && Obj.extend(objectToExtend, toMix);
                    }
                    else {
                        logger.warn(RECEIVER_NOT_ALLOWED, {
                            rec: (isClass(receiver) || isInstance(receiver)) ? receiver.getHash() : receiver
                        });
                    }
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

            allowedClasses: null,

            destructor: null,
        }
    }).extendz(ObjectMixin);
    
    function isReceiverAllowed(receiver, allowedClass) {
        return receiver === allowedClass || allowedClass.isSuperClassOf(receiver) || allowedClass.isInstance(receiver);
    }

    function mixIntoReceiver(mixIn) {
        /*jslint validthis: true */
        mixIn.mixInto(this);
    }

    /**
     * Define a mixin-method that mixes the Mixin into the Class
     * It is available for every Class created with jar.lang.Class()
     * as soon as this module is loaded
     */
    Class.addStatic('mixin', function() {
        Arr.filter(arguments, Mixin.isInstance, Mixin).each(mixIntoReceiver, this);

        return this;
    });

    return Mixin;
});