JAR.register({
    MID: 'jar.lang.MixIn',
    deps: ['System', '.Class', '.Object', '.Array!check|derive', '.Function']
}, function(System, Class, Obj, Arr, Fn) {
    'use strict';

    var MixIn = Class('MixIn', {
        $: {
            construct: function(mixInName, toMix, allowedClasses, destructor) {
                this._$name = mixInName;
                this._$toMix = Obj.from(toMix);
                this._$allowedClasses = Arr.filter(System.isArray(allowedClasses) ? allowedClasses : [allowedClasses], Class.isClass);
                this._$destructor = destructor;
                this._$logger = System.getCustomLogger('MixIn "#<' + mixInName + '>"');
            },

            mixInto: function(receiver, mixInAnyObject) {
                var logger = this._$logger,
                    isReceiverAllowed = this._$isReceiverAllowed.bind(this, receiver),
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
                        logger('The given receiver "' + receiver + '" is not part of the allowed Classes!', 'warn');
                    }
                }
                else {
                    logger('There is no receiver given!', 'warn');
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

            allowedClasses: null,

            destructor: null,

            isReceiverAllowed: Fn.from(function(receiver, allowedClass) {
                return receiver === allowedClass || allowedClass.isSuperClassOf(receiver) || System.isA(receiver, allowedClass);
            })
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