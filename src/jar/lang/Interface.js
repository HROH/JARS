JAR.register({
    MID: 'jar.lang.Interface',
    deps: ['System', 'jar', '.Class', '.Array!check|derive|iterate']
}, function(System, jar, Class, Arr) {
    'use strict';

    var interfaceTemplates = [],
        IMPLEMENTED_METHODS_MISSING = 0,
        IMPLEMENTOR_MISSING = 1,
        IMPLEMENTORTYPE_MISMATCH = 2,
        Interface;

    interfaceTemplates[IMPLEMENTED_METHODS_MISSING] = '${impl} must implement the method(s): "${missingMethods}" !';
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
            construct: function(interfaceName, methods) {
                this._$name = interfaceName;
                this._$methods = Arr.from(methods);
                this._$logger = new System.Logger('Interface "#<' + jar.getCurrentModuleName() + ':' + interfaceName + '>"', {
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
                        notImplementedMethods = methods.filter(isMethodNotImplemented, objectToCheck);

                        if (notImplementedMethods.length) {
                            logger.error(IMPLEMENTED_METHODS_MISSING, {
                                impl: (Class.isClass(implementor) || Class.isInstance(implementor)) ? implementor.getHash() : implementor,
                                missingMethods: notImplementedMethods.map(transformMethodData).join('", "')
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
    }, {
        isImplementedBy: function(interfaces, implementor, checkAny) {
            return Arr.every(interfaces, implementzInterface, {
                impl: implementor,
                any: checkAny
            });
        }
    });

    function proxiedGetMethods() {
        /*jslint validthis: true */
        return this._$methods;
    }

    function checkMethodExists(method) {
        /*jslint validthis: true */
        return method[0] === this[0];
    }

    function isMethodNotImplemented(methodData) {
        /*jslint validthis: true */
        var methodToCheck = this[methodData[0]],
            args = methodData[1];

        return !System.isFunction(methodToCheck) || (System.isNumber(args) && !(args === methodToCheck.length || args === methodToCheck.arity));
    }

    function transformMethodData(methodData) {
        return methodData.join(' (arguments: ') + ')';
    }

    function implementzInterface(iface) {
        /*jslint validthis: true */
        return iface.isImplementedBy(this.impl, this.any);
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
        /*jslint validthis: true */
        var isImplemented = false,
            currentClass = this,

            interfaces = Arr.filter(arguments, isInterface);

        if (interfaces.length) {
            isImplemented = Interface.isImplementedBy(interfaces, currentClass);
        }
        else {
            currentClass.logger.warn('There is no interface given to compare with!');
        }

        return isImplemented && this;
    }

    Class.addStatic('implementz', implementz);

    return Interface;
});