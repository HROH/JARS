JAR.register({
    MID: 'jar.lang.Class',
    deps: [{
        System: ['Logger', '::isA', '::isSet', '::isObject', '::isFunction']
    }, {
        jar: ['::getCurrentModuleName', '::use']
    }, {
        '.Object': ['::from', '::hasOwn', '!all']
    }, '.Array!check,find,index,iterate,manipulate', '.Function!advice'],
    bundle: ['Abstract', 'Final', 'Singleton']
}, function(Logger, isA, isSet, isObject, isFunction, getCurrentModuleName, useModule, fromObject, hasOwn, Obj, Arr, Fn) {
    'use strict';

    var lang = this,
        metaClassSandbox = lang.sandbox('__SYSTEM__.Class'),
        MetaClass = metaClassSandbox.add('Function'),
        protectedIdentifier = '_$',
        //privateIdentifier = '_',
        accessIdentifiers = fromObject({
            _: 'private',
            _$: 'protected'
        }),
        excludeOverride = Arr('Class', 'constructor', 'getHash', '$proxy'),
        rClass = /^[A-Z]\w+$/,
        Classes = Obj(),
        classBluePrint = ['(function(){function ', '(){return this instanceof ', '?', '.New(this,arguments):', '.New.apply(', ',arguments)};return ', '})()'],
        MSG_ALREADY_DESTRUCTED = 0,
        MSG_INVALID_OR_EXISTING_CLASS = 1,
        MSG_WRONG_CLASS = 2,
        MSG_WRONG_CLASS_AND_MODULE = 3,
        MSG_WRONG_CONTEXT = 4,
        MSG_WRONG_MODULE = 5,
        extensionPredicates = Arr(),
        instantiationPredicates = Arr(),
        ClassProtectedProperties, classFactoryLogger;

    classFactoryLogger = (function classFactoryLoggerSetup() {
        var classFactoryMessageTemplates = [],
            proxyFailed = 'Proxy failed! ',
            instanceMustBe = '${instanceHash} must be ',
            instanceOfClass = 'an instance of ${classHash}',
            inModules = 'in one of the following modules: ${missingAccess}, but has only access to ${hasAccess}';

        classFactoryMessageTemplates[MSG_ALREADY_DESTRUCTED] = proxyFailed + '${hash} was already destructed!';
        classFactoryMessageTemplates[MSG_INVALID_OR_EXISTING_CLASS] = 'Illegal or already existing Class: ${hash}';
        classFactoryMessageTemplates[MSG_WRONG_CLASS] = proxyFailed + instanceMustBe + instanceOfClass + '!';
        classFactoryMessageTemplates[MSG_WRONG_CLASS_AND_MODULE] = proxyFailed + instanceMustBe + instanceOfClass + ' or ' + inModules + '!';
        classFactoryMessageTemplates[MSG_WRONG_CONTEXT] = proxyFailed + 'Method was called in wrong context!';
        classFactoryMessageTemplates[MSG_WRONG_MODULE] = proxyFailed + instanceMustBe + inModules + '!';

        return Logger.forCurrentModule({
            tpl: classFactoryMessageTemplates
        });
    })();

    function instanceOrClassExists(instanceOrClass, checkInstance) {
        var exists = false;

        if (checkInstance && instanceOrClassExists(instanceOrClass.Class) || isClass(instanceOrClass)) {
            (exists = !! getHidden(instanceOrClass, checkInstance)) || proxyDestructed(instanceOrClass.getHash());
        }

        return exists;
    }

    function getHidden(instanceOrClass, fromInstance) {
        return (fromInstance ? getHidden(instanceOrClass.Class)[protectedIdentifier]._$instances : Classes)[instanceOrClass.getHash()];
    }

    function proxy(instanceOrClass, method, args, forInstance) {
        var instanceOrClassHidden, inPrivileged, result;

        if (instanceOrClassExists(instanceOrClass, forInstance)) {
            instanceOrClassHidden = getHidden(instanceOrClass, forInstance);
            inPrivileged = instanceOrClassHidden.$inPrivileged;

            inPrivileged || prepareBeforeProxy(instanceOrClass, instanceOrClassHidden, protectedIdentifier);

            result = method.apply(instanceOrClass, args || []);

            inPrivileged || cleanupAfterProxy(instanceOrClass, instanceOrClassHidden, protectedIdentifier);
        }

        return result;
    }

    function prepareBeforeProxy(instanceOrClass, instanceOrClassHidden, accessIdentifier) {
        instanceOrClassHidden.$inPrivileged = true;

        Obj.extend(instanceOrClass, instanceOrClassHidden[accessIdentifier]);
    }

    function cleanupAfterProxy(instanceOrClass, instanceOrClassHidden, accessIdentifier) {
        instanceOrClassHidden.$inPrivileged = false;

        instanceOrClassHidden[accessIdentifier].update(updateHiddenProperty, instanceOrClass);
    }

    function updateHiddenProperty(value, property) {
        /*jslint validthis: true */
        var newValue = this[property];

        delete this[property];

        return newValue;
    }

    function proxyDestructed(destructedHash) {
        classFactoryLogger.error(MSG_ALREADY_DESTRUCTED, {
            hash: destructedHash
        });
    }

    function createProxyFor(proxyType, proxyData) {
        var Class = proxyData.Class,
            moduleName = proxyData.module,
            isProxyDataCollected = false;

        /*jslint validthis: true */
        function proxiedMethod() {
            var instance, method, args, result;

            if (proxyType === 'instance') {
                instance = this,
                method = proxyData.method,
                args = arguments;
            }
            else {
                instance = arguments[0];
                method = arguments[1];
                args = arguments[2];

                if (!isProxyDataCollected) {
                    if (proxyType === 'class') {
                        moduleName = Class.getModuleBaseName();
                    }
                    else if (proxyType === 'module') {
                        Class = useModule(moduleName);
                    }

                    isProxyDataCollected = true;
                }
            }

            if (isProxyAllowed(instance, Class, moduleName)) {
                result = proxy(instance, method, args, true);
            }

            return result;
        }

        return proxiedMethod;
    }

    function createProxy() {
        return createProxyFor('module', {
            module: getCurrentModuleName()
        });
    }

    function createProxyForPrivilegedMethod(method) {
        /*jslint validthis: true */
        var privilegedMethod = createProxyFor('instance', {
            method: method,
            Class: this
        });

        privilegedMethod.arity = method.length || method.arity || 0;

        return privilegedMethod;
    }

    function isProxyAllowed(instance, Class, moduleName) {
        var canProxy = false,
            shouldHaveModuleAccess = !! moduleName,
            shouldHaveClassAccess = isClass(Class),
            failMessage = MSG_WRONG_CONTEXT,
            instanceClass, failData;

        if (isInstance(instance)) {
            failData = fromObject({
                instanceHash: instance.getHash()
            });

            instanceClass = instance.Class;

            if (shouldHaveModuleAccess && !(canProxy = shouldHaveClassAccess ? instanceClass.canAccessClass(Class) : instanceClass.canAccessModule(moduleName))) {
                failMessage = MSG_WRONG_MODULE;
                failData.extend({
                    hasAccess: instanceClass.getModuleAccess().join(', '),
                    missingAccess: shouldHaveClassAccess ? Class.getModuleAccess().join(', ') : moduleName
                });
            }

            if (!canProxy && shouldHaveClassAccess && !(canProxy = isA(instance, Class))) {
                failMessage = shouldHaveModuleAccess ? MSG_WRONG_CLASS_AND_MODULE : MSG_WRONG_CLASS;
                failData.extend({
                    classHash: Class.getHash()
                });
            }
        }

        canProxy || classFactoryLogger.error(failMessage, failData);

        return canProxy;
    }

    function createClassHash(name, moduleName) {
        return 'Class #<' + moduleName + ':' + name + '>';
    }

    function retrieveClass(allClasses, classData) {
        allClasses.push(classData.Class);

        return allClasses;
    }

    function retrieveSubclasses(subClasses, SubClass) {
        subClasses.push(SubClass);
        subClasses.merge(SubClass.getSubClasses(true));

        return subClasses;
    }

    function retrieveInstances(instances, instanceData) {
        instances.push(instanceData.instance);

        return instances;
    }

    function retrieveSubClassInstances(instances, SubClass) {
        return instances.merge(SubClass.getInstances(true));
    }

    function destructInstance(instance) {
        instance.Class.destruct(instance);
    }

    function destructSubClass(SubClass) {
        SubClass.destruct(SubClass);
    }

    ClassProtectedProperties = fromObject({
        _$isProto: false,

        _$skipCtor: false,

        _$superClass: null,

        _$modBaseName: null,

        _$modAccess: null,
        /**
         * @param {string} method
         * @param {function()} methodName
         */
        _$overrideMethod: function(method, methodName) {
            var Class = this,
                classHiddenProto = Class._$proto,
                protoToOverride,
                SuperClass = Class._$superClass,
                superClassHiddenProto,
                superProto, superMethod, currentSuper;

            // Never override Class()-, constructor()-, $proxy()- and getHash()-methods
            if (SuperClass && isFunction(method) && !excludeOverride.contains(methodName)) {
                superClassHiddenProto = getHidden(SuperClass)[protectedIdentifier]._$proto;

                if (methodName in SuperClass.prototype) {
                    protoToOverride = Class.prototype;
                    superProto = SuperClass.prototype;
                }
                else if (methodName in superClassHiddenProto) {
                    protoToOverride = classHiddenProto;
                    superProto = superClassHiddenProto;
                }

                // check if the method is overriding a method in the SuperClass.prototype and is not already overridden in the current Class.prototype
                if (superProto && isFunction(superProto[methodName]) && superProto[methodName] !== method && (!hasOwn(protoToOverride, methodName) || protoToOverride[methodName] === method)) {
                    superMethod = function $super() {
                        return superProto[methodName].apply(this, arguments);
                    };

                    protoToOverride[methodName] = Fn.around(method, function beforeMethodCall() {
                        currentSuper = this.$super;

                        // create a new temporary this.$super that uses the method of the SuperClass.prototype
                        this.$super = superMethod;

                    }, function afterMethodCall() {
                        // restore or delete this.$super
                        if (currentSuper) {
                            this.$super = currentSuper;
                        }
                        else {
                            delete this.$super;
                        }
                    });
                }
            }
        }
    });

    function overridePrototypeMethods(protoToOverride) {
        /*jslint validthis: true */
        protoToOverride.each(this._$overrideMethod, this);
    }

    addStatic({
        /**
         * Initiates a new instance
         * Although it accesses hidden properties on the Class
         * it doesn't use 'proxyClass()' to achieve this
         * The reason is that this method calls 'construct()' on the instance
         * so there would be a possibility to manipulate the hidden Class-properties
         *
         * @param {(Object|Array)} instance
         * @param {Array} args
         * 
         * @return {(Object|undefined)} instance if singleton exists, called directly or via Class.extendz, empty object if abstract, else undefined
         */
        New: function(instance, args) {
            var Class = this,
                logger = Class.logger,
                classProtectedProps = getHidden(Class)[protectedIdentifier],
                instances = classProtectedProps._$instances,
                instanceHashPrefix, instanceHash, construct, returnValue, failingPredicate;

            // Class._$isProto is true when a SubClass is inheriting over SubClass.extendz(SuperClass)
            // In this case we don't need the constructor to be executed neither do we need a new instance to be saved
            if (classProtectedProps._$isProto) {
                returnValue = instance;
            }
            else {
                failingPredicate = instantiationPredicates.find(predicateFails, Class);

                if (failingPredicate) {
                    logger.warn(failingPredicate.message);

                    returnValue = failingPredicate.ret(Class);
                }
                else {
                    if (isA(instance, Class) && !isFunction(instance.getHash)) {
                        // If we have a new instance that is not stored in the instances yet
                        // create a unique hash for it and store a reference under this hash for later use.
                        // This hash is also used to store the private/protected properties/methods.
                        //
                        // Note: If an instance isn't used anymore this reference has to be deleted over the destructor of the instance
                        // Otherwise this could lead to memory leaks if there are too many instances
                        instanceHashPrefix = 'Object #<' + classProtectedProps._$modName + ':' + classProtectedProps._$clsName + '#';

                        do {
                            instanceHash = instanceHashPrefix + lang.generateHash('xx-x-x-x-xxx') + '>';
                        }
                        while (hasOwn(instances, instanceHash));

                        // !!!IMPORTANT: never delete or override this method!!!
                        instance.getHash = function() {
                            return instanceHash;
                        };

                        instances[instanceHash] = {
                            instance: instance,

                            $inPrivileged: false,

                            $destructors: Arr(),
                            // protected
                            _$: classProtectedProps._$proto.copy(),
                            // TODO private
                            _: Obj()
                        };
                    }
                    else {
                        // We came here because Class.New was called directly
                        // [ Class.New(arg1, arg2, ...) <--> new Class(arg1, arg2, ...) ]
                        // So we have to create a new instance and return it

                        // Copy values from arguments into an array. Just using arguments seems to be a problem
                        // (at least in chrome 31.0.1650.57 m, but it seems to be the normal case in all browsers),
                        // because when we reassign instance, which is arguments[0], arguments is reflecting the change and so does args
                        // resulting in a wrong value being passed to instance.construct()
                        //
                        // Example: SomeClass.New(arg1, arg2)
                        //
                        // arguments would first be:
                        //	{0: arg1 (instance), 1: arg2 (args)}
                        //
                        // after reassinging instance, arguments is:
                        //	{0: instanceOfSomeClass (instance), 1: arg2 (args)}
                        //
                        // resulting in:
                        //	instanceOfSomeClass.construct(instanceOfSomeClass, arg2)
                        //
                        // instead of:
                        //	instanceOfSomeClass.construct(arg1, arg2)
                        args = Arr.fromArrayLike(arguments);

                        classProtectedProps._$skipCtor = true;
                        instance = new Class();
                        classProtectedProps._$skipCtor = false;

                        returnValue = instance;
                    }

                    construct = instance.construct;

                    if (!classProtectedProps._$skipCtor && construct) {
                        construct.apply(instance, args);
                    }
                }
            }

            return returnValue;
        },

        toString: function() {
            return this.getHash();
        },
        /**
         *
         *
         * @return {boolean}
         */
        hasSuperClass: function() {
            return !!this.getSuperClass();
        },
        /**
         *
         *
         * @return {boolean}
         */
        hasSubClasses: function() {
            return this.getSubClasses().length > 0;
        },
        /**
         *
         *
         * @param {Class} SuperClass
         *
         * @return {boolean}
         */
        isSubClassOf: function(SuperClass) {
            return isClass(SuperClass) && isA(this.prototype, SuperClass);
        },
        /**
         *
         *
         * @param {Class} SuperClass
         *
         * @return {boolean}
         */
        isSuperClassOf: function(SubClass) {
            return isClass(SubClass) && isA(SubClass.prototype, this);
        },
        /**
         *
         *
         * @param {Class} Class
         *
         * @return {boolean}
         */
        isOf: function(Class) {
            return this === Class || this.isSubClassOf(Class);
        },

        getModule: function() {
            return useModule(this.getModuleName());
        },

        getModuleBase: function() {
            return useModule(this.getModuleBaseName());
        },

        canAccessClass: function(Class) {
            return isClass(Class) && Arr.some(Class.getModuleAccess(), this.canAccessModule, this);
        },

        canAccessModule: function(moduleName) {
            return this.getModuleAccess().some(isModuleNameStartingWith, moduleName);
        },

        createSubClass: function(name, proto, staticProperties) {
            return ClassFactory(name, proto, staticProperties).extendz(this);
        },
        /**
         * Returns the name of the Class like it was passed to 'jar.lang.Class()'
         *
         * @return {String} the classname that the Class was created with
         */
        $getClassName: function() {
            return this._$clsName;
        },
        /**
         * Returns the name of the module in which the Class was created
         *
         * @return {string} the modulename
         */
        $getModuleName: function() {
            return this._$modName;
        },

        $getModuleBaseName: function() {
            var Class = this,
                moduleName = Class._$modName,
                baseName = Class._$modBaseName;

            if (!isSet(baseName)) {
                Class._$modBaseName = baseName = (useModule(moduleName) === Class) ? moduleName.substring(0, moduleName.lastIndexOf('.')) || moduleName : moduleName;
            }

            return baseName;
        },

        $getModuleAccess: function() {
            var Class = this,
                moduleAccess = Class._$modAccess,
                baseName;

            if (!moduleAccess) {
                Class._$modAccess = moduleAccess = Arr();

                do {
                    baseName = Class.getModuleBaseName();
                    moduleAccess.contains(baseName) || moduleAccess.push(baseName);
                    Class = Class.getSuperClass();
                } while (isClass(Class));
            }

            return moduleAccess;
        },
        /**
         * @return {Class} the SuperClass of this Class
         */
        $getSuperClass: function() {
            return this._$superClass;
        },
        /**
         * @return {Array.<Class>} an array of all SubClasses
         */
        $getSubClasses: function(includeSubclasses) {
            return includeSubclasses ? this._$subClasses.reduce(retrieveSubclasses, Arr()) : this._$subClasses.values();
        },
        /**
         * Method to mimick classical inheritance in JS
         * It uses prototypal inheritance inside but makes developing easier
         * To call a parent-method use this.$super(arg1, arg2, ...)
         *
         * Note: The SuperClass has to be created with jar.lang.Class()
         * 
         * Example:
         * 
         *		var MySubClass = jar.lang.Class('MySubClass', {
         *			construct: function() {
         *				//constructor-code goes here...
         *				this.$super(arg1, arg2) // Call the constructor of the SuperClass
         *			},
         *
         *			myMethod: function(param) {
         *				// do something...
         *				this.$super(param) // Call the myMethod-method of the SuperClass
         *			}
         *		}).extendz(MyClass);
         *
         * For simplification you can use MyClass.createSubClass('MySubClass', ...)
         * 
         * 
         * @param {Class} SuperClass
         * 
         * @return {Class}
         */
        $extendz: function(SuperClass, proto, staticProperties) {
            var Class = this,
                data = {
                    Class: Class,
                    SuperClass: SuperClass
                },
                superClassHiddenProtectedProps, message, failingPredicate;

            failingPredicate = extensionPredicates.find(predicateFails, data);

            if (failingPredicate) {
                message = 'The Class can\'t be extended! ' + failingPredicate.message;
                SuperClass = data.SuperClass;

                Class.logger.error(message, {
                    superClassHash: SuperClass && SuperClass.getHash()
                });

                Class = data.Class;
            }
            else {
                buildPrototypeMapping(Class, proto);

                superClassHiddenProtectedProps = getHidden(SuperClass)[protectedIdentifier];
                // add SuperClass reference
                Class._$superClass = SuperClass;
                // extend own private/protected prototype with that of the SuperClass
                Class._$proto.extend(superClassHiddenProtectedProps._$proto);
                // add SubClass reference in the SuperClass
                superClassHiddenProtectedProps._$subClasses[Class.getHash()] = Class;

                // Prevent the default constructor and objectHash-generation to be executed
                superClassHiddenProtectedProps._$isProto = true;
                // Create a new instance of the SuperClass and merge it with the current prototype
                // to override in the correct order
                Class.prototype = new SuperClass().merge(Class.prototype);
                // end inheriting
                superClassHiddenProtectedProps._$isProto = false;

                // extend Class with static methods of SuperClass
                Obj.extend(Class, staticProperties || {}, SuperClass);

                // Check if methods in the public and the protected prototype were overridden
                // and do it properly so that this.$super() works in instances
                Arr.each([Class.prototype, Class._$proto], overridePrototypeMethods, Class);
            }

            return Class;
        },
        /**
         * @return {Array.<Object>}
         */
        $getInstances: function(includeSubclasses) {
            var instances = this._$instances.reduce(retrieveInstances, Arr());

            if (includeSubclasses) {
                instances = this._$subClasses.reduce(retrieveSubClassInstances, instances);
            }

            return instances;
        },

        $getInstance: function(instanceHash) {
            var instanceData = this._$instances[instanceHash];

            return instanceData ? instanceData.instance : false;
        },
        /**
         * @param {function():void} destructor
         * @param {Object} instance
         * 
         * @return {Class}
         */
        $addDestructor: function(destructor, instance) {
            var Class = this,
                destructors;

            if (isFunction(destructor)) {
                if (isA(instance, Class)) {
                    destructors = getHidden(instance, true).$destructors;
                }
                else {
                    destructors = Class._$destructors;
                }

                destructors.push(destructor);
            }

            return Class;
        },
        /**
         * @param {Object} instance
         *
         * @return {Class}
         */
        $destruct: function(instance) {
            var Class = this,
                SuperClass = Class._$superClass,
                instances = Class._$instances,
                destructors,
                hash;

            if (isInstance(instance)) {
                hash = instance.getHash();

                if (isA(instance, Class) && hasOwn(instances, hash)) {
                    destructors = instances[hash].$destructors;

                    do {
                        destructors.mergeUnique(getHidden(Class)[protectedIdentifier]._$destructors);
                        Class = Class.getSuperClass();
                    } while (Class);

                    while (destructors.length) {
                        proxy(instance, destructors.shift(), true);
                    }

                    delete instances[hash];
                }
                else if (instance.Class !== Class) {
                    instance.Class.destruct(instance);
                }
                else {
                    Class.logger.warn('"' + hash + '" is already destructed');
                }

                return this;
            }
            /* */
            else if (instance === Class) {
                hash = Class.getHash();

                Class.getInstances().each(destructInstance);

                Class.getSubClasses().each(destructSubClass);

                if (SuperClass) {
                    delete getHidden(SuperClass)[protectedIdentifier]._$subClasses[hash];
                }

                metaClassSandbox.remove(classBluePrint.join(Class.getClassName()));

                delete Classes[hash];

                return undefined;
            }
            /* */
        }
    });

    isExtendableWhen(function superclassIsGiven(data) {
        return isClass(data.SuperClass);
    }, 'There is no SuperClass given!');

    isExtendableWhen(function superclassIsNotSelf(data) {
        return data.SuperClass !== data.Class;
    }, 'The Class can\'t extend itself!');

    isExtendableWhen(function classHasNoSuperClass(data) {
        var hasNoSuperClass = !data.Class.hasSuperClass();

        hasNoSuperClass || (data.SuperClass = data.Class.getSuperClass());

        return hasNoSuperClass;
    }, 'The Class already has the SuperClass: "${superClassHash}"!');

    isExtendableWhen(function classHasNoInstancesAndSubClasses(data) {
        return !data.Class.getInstances().length && !data.Class.hasSubClasses();
    }, 'The Class already has instances or SubClasses!');

    isExtendableWhen(function superclassIsNoSubClassOfClass(data) {
        return !data.SuperClass.isSubClassOf(data.Class);
    }, 'The given SuperClass: "${superClassHash}" is already inheriting from this Class!');

    function predicateFails(predicateData) {
        /*jslint validthis: true */
        return !predicateData.predicate(this);
    }

    function isModuleNameStartingWith(moduleAccess) {
        /*jslint validthis: true */
        return this.indexOf(moduleAccess) === 0;
    }

    /**
     * This method is used to add methods like 'implementz' or 'mixin'
     * to all Classes, when the module is loaded
     * Added methods are automatically available to every Class
     *
     * @param {(String|Object.<string, function()>)} methodName
     * @param {(function()|undefined)} method
     */
    function addStatic(methodName, method) {
        var methods = {};

        if (isObject(methodName)) {
            methods = methodName;
        }
        else {
            methods[methodName] = method;
        }

        Obj.reduce(methods, addProxiedMetaMethod, MetaClass.prototype);
    }

    function addProxiedMetaMethod(metaProto, method, methodName) {
        var newMethod = method;

        if (!hasOwn(metaProto, methodName) || methodName === 'toString') {
            if (methodName.indexOf('$') === 0) {
                methodName = methodName.substring(1);

                newMethod = function proxiedMetaMethod() {
                    return proxy(this, method, arguments);
                };
            }

            metaProto[methodName] = newMethod;
        }

        return metaProto;
    }

    /**
     * 
     * @param {function(Class):Boolean} predicate
     * @param {function(Class):*} optionalReturn
     * @param {String} message
     */
    function isInstanceableWhen(predicate, optionalReturn, message) {
        instantiationPredicates.push({
            predicate: predicate,

            message: message,

            ret: optionalReturn
        });
    }

    /**
     * 
     * @param {function(Class):Boolean} predicate
     * @param {String} message
     */
    function isExtendableWhen(predicate, message) {
        extensionPredicates.push({
            predicate: predicate,

            message: message
        });
    }

    /**
     * @param {Class} Class
     * 
     * @return {Boolean}
     */
    function isClass(Class) {
        return isA(Class, MetaClass);
    }

    /**
     * @param {Object} instance
     * 
     * @return {Boolean}
     */
    function isInstance(instance) {
        return instance && isClass(instance.Class) && isA(instance, instance.Class);
    }

    /**
     * @param {String} classHashOrName
     * @param {String} moduleName
     * 
     * @return {Class}
     */
    function getClass(classHashOrName, moduleName) {
        return (Classes[classHashOrName] || Classes[createClassHash(classHashOrName, moduleName || getCurrentModuleName())] || {}).Class;
    }

    /**
     * 
     * @return {Array<Class>}
     */
    function getClasses() {
        return Classes.reduce(retrieveClass, Arr());
    }

    /**
     * @param {(Class|String)} ClassOrHash
     * @param {Boolean} includeSubclasses
     * 
     * @return {(Array.<Object>|undefined)}
     */
    function getInstances(ClassOrHash, includeSubclasses) {
        if (!isClass(ClassOrHash)) {
            ClassOrHash = getClass(ClassOrHash);
        }

        return ClassOrHash ? ClassOrHash.getInstances(includeSubclasses) : undefined;
    }

    function buildPrototypeMapping(Class, proto) {
        if (proto) {
            Class.prototype.extend(proto);
            accessIdentifiers.each(buildAccessLookupPrototype, Class);
            buildPrivilegedMethods(Class);
        }
    }

    //TODO
    /**
     * @param {String} accessIdentifierAlias
     * @param {String} accessIdentifier
     */
    function buildAccessLookupPrototype(accessIdentifierAlias, accessIdentifier) {
        /*jslint validthis: true */
        var Class = this,
            classHidden = getHidden(Class),
            proto = Class.prototype,
            hiddenProto = classHidden[accessIdentifier][accessIdentifier + 'proto'];

        if (hasOwn(proto, accessIdentifier) || hasOwn(proto, accessIdentifierAlias)) {
            Obj.each(proto[accessIdentifier] || proto[accessIdentifierAlias], function addHiddenProperty(value, property) {
                hiddenProto[accessIdentifier + property] = value;
            });

            delete proto[accessIdentifier];
            delete proto[accessIdentifierAlias];
        }
    }

    function buildPrivilegedMethods(Class) {
        var proto = Class.prototype;

        if (hasOwn(proto, '$')) {
            proto.extend(Obj.map(Obj.filter(proto.$, isFunction), createProxyForPrivilegedMethod, Class));

            delete proto.$;
        }
    }

    /**
     * Function to create Classes in a more classical way
     * It is available as jar.lang.Class(), later
     * 
     * An example would be:
     *
     * var MyClass = jar.lang.Class('MyClass', {
     *		construct: function() {
     *			//constructor-code goes here...
     *		},
     *		
     *		myMethod: function(param) {
     *			//do something
     *		},
     *		
     *		myMethod2: function()
     *			this.myMethod('test');
     *		}
     * });
     * 
     * 
     * @param {string} name
     * @param {Object<string, *>} proto
     * @param {Object<string, *>} staticProperties
     * 
     * @return {Class}
     */
    function ClassFactory(name, proto, staticProperties) {
        var moduleName = getCurrentModuleName(),
            classHash = createClassHash(name, moduleName),
            Class;

        if (rClass.test(name) && !hasOwn(Classes, classHash)) {
            Class = metaClassSandbox.add(classBluePrint.join(name));

            Obj.merge(Class, {
                // Extend the prototype with some methods defined in Obj (see module jar.lang.Object)
                prototype: Obj().extend({
                    constructor: Class,

                    Class: Class,

                    toString: function() {
                        return this.getHash();
                    }
                }),

                logger: new Logger(classHash),

                getHash: function() {
                    return classHash;
                }
            }, staticProperties);

            // Store a reference of the Class and define some protected properties
            Classes[classHash] = fromObject({
                Class: Class,

                $inPrivileged: false,

                _$: fromObject({
                    _$clsName: name,

                    _$modName: moduleName,

                    _$subClasses: Obj(),

                    _$proto: fromObject({
                        $proxy: createProxyFor('class', {
                            Class: Class
                        })
                    }),

                    _$instances: Obj(),

                    _$destructors: Arr()
                }).extend(ClassProtectedProperties),
                // TODO
                _: fromObject({
                    _proto: Obj()
                })
            });

            buildPrototypeMapping(Class, proto);
        }
        else {
            classFactoryLogger.warn(MSG_INVALID_OR_EXISTING_CLASS, {
                hash: classHash
            });
        }

        return Class;
    }

    Obj.extend(ClassFactory, {
        addStatic: addStatic,

        getClass: getClass,

        getClasses: getClasses,

        getInstances: getInstances,

        isClass: isClass,

        isInstance: isInstance,

        isInstanceableWhen: isInstanceableWhen,

        isExtendableWhen: isExtendableWhen,

        createProxy: createProxy
    });

    return ClassFactory;
});