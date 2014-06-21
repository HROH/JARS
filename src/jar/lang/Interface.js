JAR.register({
    MID: 'jar.lang.Interface',
    deps: ['System', '.Class', '.Array!check|derive|iterate']
}, function(System, Class, Arr) {
    'use strict';

    var interfaceTemplates = [],
        IMPLEMENTED_METHODS_MISSING = 0,
        IMPLEMENTOR_MISSING = 1,
        IMPLEMENTORTYPE_MISMATCH = 2,
        Interface;

    interfaceTemplates[IMPLEMENTED_METHODS_MISSING] = '${impl} must implement the methods: "${missingMethods}" !';
    interfaceTemplates[IMPLEMENTOR_MISSING] = 'No Class, instance or Object given to check!';
    interfaceTemplates[IMPLEMENTORTYPE_MISMATCH] = 'You must provide a Class or instance to check';

    Interface = Class('Interface', {
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
                this._$logger = new System.Logger('Interface "#<' + iFaceName + '>"', {
                    tpl: interfaceTemplates
                });
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

            isImplementedBy: function(implementor, checkAny) {
                var logger = this._$logger,
                    methods = this._$methods,
                    isImplemented = false,
                    objectToCheck, notImplementedMethods;

                if (implementor) {
                    objectToCheck = Class.isClass(implementor) ? implementor.prototype : (checkAny || Class.isInstance(implementor)) ? implementor : null;

                    if (objectToCheck) {
                        notImplementedMethods = methods.filter(isMethodNotImplemented, objectToCheck).map(transformMethodData);

                        if (notImplementedMethods.length) {
                            logger.error(IMPLEMENTED_METHODS_MISSING, {
                                impl: (Class.isClass(implementor) || Class.isInstance(implementor)) ? implementor.getHash() : implementor,
                                missingMethods: notImplementedMethods.join('", "')
                            });
                        }
                        else {
                            isImplemented = true;
                        }
                    }
                    else {
                        logger.warn(IMPLEMENTORTYPE_MISMATCH);
                    }
                }
                else {
                    logger.warn(IMPLEMENTOR_MISSING);
                }

                return isImplemented;
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

    function implementzInterface(iface) {
        return iface.isImplementedBy(this);
    }

    function isInterface(iface) {
        return System.isA(iface, Interface);
    }

    /**
     * Checks whether any method of InterFace.methods is defined in the Class
     * Returns the Class if all methods exist false otherwise
     * 
     * @param Object... iface
     * 
     * @return Object
     */
    function implementz() {
        var isImplemented = false,
            currentClass = this,

            interfaces = Arr.filter(arguments, isInterface);

        if (interfaces.length) {
            isImplemented = Arr.every(interfaces, implementzInterface, currentClass);
        }
        else {
            currentClass.logger.warn('There is no interface given to compare with!');
        }

        return isImplemented && this;
    }

    Class.addStatic('implementz', implementz);

    return Interface;
});