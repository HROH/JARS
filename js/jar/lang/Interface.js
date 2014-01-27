JAR.register({
    MID: 'jar.lang.Interface',
    deps: ['System', '.Class', '.Object', '.Array!check|derive']
}, function(System, Class, Obj, Arr) {
    'use strict';

    var Interface = Class('Interface', {
        _$: {
            name: '',

            methods: null,

            logger: null,

            addMethod: function(method) {
                var methods = this._$methods;

                methods.some(checkMethodExists, method) || methods.push(method);
            }
        },

        $: {
            construct: function(iFaceName, methods) {
                this._$name = iFaceName;
                this._$methods = Arr.from(methods);
                this._$logger = System.getCustomLogger('Interface "#<' + iFaceName + '>"');
            },

            extendz: function(superInterface) {
                var iface = this;

                if (System.isA(superInterface, Interface)) {
                    iface.$proxy(superInterface, proxiedGetMethods).each(iface._$addMethod, iface);
                }

                return iface;
            },

            getName: function() {
                return this._$name;
            },

            isImplementedBy: function(object, checkAnyObject) {
                var logger = this._$logger,
                    methods = this._$methods,
                    isObject = checkAnyObject && System.isObject(object),
                    objectToCheck = Class.isClass(object) ? object.prototype : (Class.isInstance(object) || isObject) ? object : null,
                    notImplementedMethods;

                if (objectToCheck) {
                    notImplementedMethods = methods.filter(isMethodNotImplemented, objectToCheck).map(transformMethodData);

                    if (notImplementedMethods.length) {
                        logger((isObject ? 'The given object' : '"' + object.getHash() + '"') + ' must implement the methods: "' + notImplementedMethods.join('", "') + '" !', 'error');
                        object = false;
                    }
                }
                else {
                    logger('No Class, Instance or Object given to check!', 'warn');
                }

                return object;
            }
        }
    });

    function proxiedGetMethods() {
        return this._$methods;
    }

    function checkMethodExists(method) {
        return method[0] === this[0];
    }

    function isMethodNotImplemented(methodData) {
        var methodToCheck = this[methodData[0]],
            args = methodData[1];

        return !System.isFunction(methodToCheck) || (System.isNumber(args) && !(args === methodToCheck.length || args === methodToCheck.arity));
    }

    function transformMethodData(methodData) {
        return methodData.join(' (arguments: ') + ')';
    }

    function implementzInterface(Iface) {
        return !System.isA(Iface, Interface) || Iface.isImplementedBy(this);
    }

    /**
     * Checks whether any method of InterFace.methods is defined in the Class
     * Returns the Class if all methods exist false otherwise
     * 
     * @param Object Iface
     * 
     * @return Object
     */
    function implementz() {
        var isImplemented = false,
            currentClass = this;

        if (arguments.length) {
            isImplemented = Arr.every(arguments, implementzInterface, currentClass);
        }
        else {
            currentClass.logger('There is no interface given to compare with!', 'warn');
        }

        return isImplemented && this;
    }

    Class.addStatic('implementz', implementz);

    return Interface;
});