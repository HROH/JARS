JAR.register({
    MID: 'jar.lang.MixIn',
    deps: ['System', '.Class', '.Object', '.Array!check|derive', '.Function!modargs']
}, function(System, Class, Obj, Arr, Fn) {
    'use strict';

    var RECEIVER_MISSING = 0,
        RECEIVER_NOT_ALLOWED = 1,
        mixinTemplates = [],
        MixIn;

    mixinTemplates[RECEIVER_MISSING] = 'There is no receiver given!';
    mixinTemplates[RECEIVER_NOT_ALLOWED] = 'The given receiver "{{receiver}}" is not part of the allowed Classes!';

    MixIn = Class('MixIn', {
        $: {
            construct: function(mixInName, toMix, allowedClasses, destructor) {
                this._$name = mixInName;
                this._$toMix = Obj.from(toMix);
                this._$allowedClasses = Arr.filter(System.isArray(allowedClasses) ? allowedClasses : [allowedClasses], Class.isClass);
                this._$destructor = destructor;
                this._$log = System.getCustomLog('MixIn "#<' + mixInName + '>"', mixinTemplates);
            },

            mixInto: function(receiver, mixInAnyObject) {
                var log = this._$log,
                    isReceiverAllowed = Fn.partial(this._$isReceiverAllowed, receiver),
                    toMix = this._$toMix,
                    allowedClasses = this._$allowedClasses,
                    destructor = this._$destructor,
                    objectToExtend;

                if (receiver) {

                    if (Arr.every(allowedClasses, isReceiverAllowed)) {
                        if (Class.isClass(receiver)) {
                            objectToExtend = receiver.prototype;
                            receiver.addDestructor(destructor);
                        }
                        else if (Class.isInstance(receiver)) {
                            objectToExtend = receiver;
                            receiver.Class.addDestructor(destructor, receiver);
                        }
                        else if (mixInAnyObject && System.isObject(receiver)) {
                            objectToExtend = receiver;
                        }

                        objectToExtend && Obj.extend(objectToExtend, toMix);
                    }
                    else {
                        log(RECEIVER_NOT_ALLOWED, 'warn', {
                            receiver: receiver
                        });
                    }
                }
                else {
                    log(RECEIVER_MISSING, 'warn');
                }

                return receiver;
            },

            getName: function() {
                return this._$name;
            }
        },

        _$: {
            name: '',

            log: null,

            toMix: null,

            allowedClasses: null,

            destructor: null,

            isReceiverAllowed: function(receiver, allowedClass) {
                return receiver === allowedClass || allowedClass.isSuperClassOf(receiver) || System.isA(receiver, allowedClass);
            }
        }
    });

    /**
     * Define a mixin-method that mixes the MixIn into the Class
     * It is available for every Class created with jar.lang.Class()
     * as soon as this module is loaded
     */
    function mixin(mixIn) {
        if (System.isA(mixIn, MixIn)) {
            mixIn.mixInto(this);
        }

        return this;
    }

    Class.addStatic('mixin', mixin);

    return MixIn;
});