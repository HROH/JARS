JAR.register({
    MID: 'jar.lang.MixIn',
    deps: [{
        System: ['::isArray', 'Logger']
    }, 'jar::getCurrentModuleData', {
        '.Class': ['.', '::isClass', '::isInstance']
    }, '.Object', '.Array!check,derive,iterate', '.Function!modargs']
}, function(isArray, Logger, getCurrentModuleData, Class, isClass, isInstance, Obj, Arr, Fn) {
    'use strict';

    var RECEIVER_MISSING = 0,
        RECEIVER_NOT_ALLOWED = 1,
        mixinTemplates = [],
        MixIn;

    mixinTemplates[RECEIVER_MISSING] = 'There is no receiver given!';
    mixinTemplates[RECEIVER_NOT_ALLOWED] = 'The given receiver "${rec}" is not part or instance of the allowed Classes!';

    MixIn = Class('MixIn', {
        $: {
            construct: function(mixInName, toMix, options) {
                var allowedClasses;

                options = options || {};

                allowedClasses = options.classes;

                this._$name = mixInName;
                this._$toMix = Obj.from(toMix);
                this._$allowAny = options.allowAny;
                this._$allowedClasses = Arr.filter(isArray(allowedClasses) ? allowedClasses : [allowedClasses], isClass);
                this._$neededMixIns = Arr.filter(options.depends || [], MixIn.isInstance, MixIn);
                this._$destructor = options.destructor;
                this._$logger = new Logger('MixIn "#<' + getCurrentModuleData().moduleName + ':' + mixInName + '>"', {
                    tpl: mixinTemplates
                });
            },

            mixInto: function(receiver) {
                var logger = this._$logger,
                    isReceiverAllowed = Fn.partial(this._$isReceiverAllowed, receiver),
                    toMix = this._$toMix,
                    allowedClasses = this._$allowedClasses,
                    destructor = this._$destructor,
                    objectToExtend;

                if (receiver) {
                    if (this._$neededMixIns.length) {
                        this._$neededMixIns.each(mixIntoReceiver, receiver);
                    }

                    if (this._$allowAny || Arr.every(allowedClasses, isReceiverAllowed)) {
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
            name: '',

            logger: null,

            toMix: null,

            allowAny: false,

            allowedClasses: null,

            neededMixIns: null,

            destructor: null,

            isReceiverAllowed: function(receiver, allowedClass) {
                return receiver === allowedClass || allowedClass.isSuperClassOf(receiver) || allowedClass.isInstance(receiver);
            }
        }
    });

    function mixIntoReceiver(mixIn) {
        /*jslint validthis: true */
        mixIn.mixInto(this);
    }

    /**
     * Define a mixin-method that mixes the MixIn into the Class
     * It is available for every Class created with jar.lang.Class()
     * as soon as this module is loaded
     */
    Class.addStatic('mixin', function() {
        Arr.filter(arguments, MixIn.isInstance, MixIn).each(mixIntoReceiver, this);

        return this;
    });

    return MixIn;
});