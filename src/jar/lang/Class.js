JAR.register({
    MID: 'jar.lang.Class',
    deps: ['System', '..' /* jar */ , '.Object!all', '.Array!check|index|iterate|manipulate', '.Function!advice']
}, function(System, jar, Obj, Arr, Fn) {
    'use strict';

    var lang = this,
        isA = System.isA,
        isFunction = System.isFunction,
        hasOwn = Obj.hasOwn,
        getCurrentModuleName = jar.getCurrentModuleName,
        useModule = jar.use,
        metaClassSandbox = lang.sandbox('__SYSTEM__.Class'),
        MetaClass = metaClassSandbox.add('Function'),
        protectedIdentifier = '_$',
        //privateIdentifier = '_',
        accessIdentifiers = Obj.from({
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
        ClassPrivilegedMethods, ClassProtectedProperties, classFactoryLogger;

    classFactoryLogger = (function classFactoryLoggerSetup() {
        var classFactoryMessageTemplates = [],
            proxyFailed = 'Proxy failed! ',
            instanceMustBe = '${instanceHash} must be ',
            instanceOfClass = 'an instance of ${classHash}',
            inModules = 'in one of the following modules: ${missingAccess}, but has only access to ${hasAccess}';

        classFactoryMessageTemplates[MSG_ALREADY_DESTRUCTED] = proxyFailed + '${hash} was already destructed!';
        classFactoryMessageTemplates[MSG_INVALID_OR_EXISTING_CLASS] = 'Illegal or already existing Classname: ${name}';
        classFactoryMessageTemplates[MSG_WRONG_CLASS] = proxyFailed + instanceMustBe + instanceOfClass + '!';
        classFactoryMessageTemplates[MSG_WRONG_CLASS_AND_MODULE] = proxyFailed + instanceMustBe + instanceOfClass + ' or ' + inModules + '!';
        classFactoryMessageTemplates[MSG_WRONG_CONTEXT] = proxyFailed + 'Method was called in wrong context!';
        classFactoryMessageTemplates[MSG_WRONG_MODULE] = proxyFailed + instanceMustBe + inModules + '!';

        return System.Logger.forCurrentModule({
            tpl: classFactoryMessageTemplates
        });
    })();

    function proxyClass(Class, method, args) {
        var classHash = Class.getHash(),
            classHidden = Classes[classHash],
            result;

        if (classHidden) {
            result = proxy(Class, classHidden, method, args);
        }
        else {
            proxyDestructed(classHash);
        }

        return result;
    }

    function proxyInstance(instance, method, args) {
        var Class = instance.Class,
            classHash = Class.getHash(),
            classHidden = Classes[classHash],
            classHiddenProtectedProps, instanceHash, instanceHidden, result;

        if (classHidden) {
            classHiddenProtectedProps = classHidden[protectedIdentifier];
            instanceHash = instance.getHash();
            instanceHidden = classHiddenProtectedProps._$instances[instanceHash];

            if (instanceHidden) {
                result = proxy(instance, instanceHidden, method, args);
            }
            else {
                proxyDestructed(instanceHash);
            }
        }
        else {
            proxyDestructed(classHash);
        }

        return result;
    }

    function proxy(instanceOrClass, instanceOrClassHidden, method, args) {
        var inPrivileged = instanceOrClassHidden.$inPrivileged,
            result;

        inPrivileged || prepareBeforeProxy(instanceOrClass, instanceOrClassHidden, protectedIdentifier);

        result = method.apply(instanceOrClass, args || []);

        inPrivileged || cleanupAfterProxy(instanceOrClass, instanceOrClassHidden, protectedIdentifier);

        return result;
    }

    function prepareBeforeProxy(instanceOrClass, instanceOrClassHidden, accessIdentifier) {
        instanceOrClassHidden.$inPrivileged = true;

        Obj.extend(instanceOrClass, instanceOrClassHidden[accessIdentifier]);
    }

    function cleanupAfterProxy(instanceOrClass, instanceOrClassHidden, accessIdentifier) {
        instanceOrClassHidden.$inPrivileged = false;

        instanceOrClassHidden[accessIdentifier].each(updateHiddenProperty, instanceOrClass);
    }

    function updateHiddenProperty(value, property, hiddenProps) {
        if (this[property] !== value) {
            hiddenProps[property] = this[property];
        }

        delete this[property];
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

        function innerProxy() {
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
                result = proxyInstance(instance, method, args);
            }

            return result;
        }

        return innerProxy;
    }

    function createProxy() {
        return createProxyFor('module', {
            module: getCurrentModuleName()
        });
    }

    function createProxyForPrivilegedMethod(method) {
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
            failData = Obj.from({
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

    function createClassHash(name) {
        return 'Class #<' + name + '>';
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

    ClassProtectedProperties = Obj.from({
        _$isAbstract: false,

        _$isFinal: false,

        _$single: null,

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
                superClassHiddenProto = Classes[SuperClass.getHash()][protectedIdentifier]._$proto;

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

    ClassPrivilegedMethods = Obj.from({
        /**
         * Returns the name of the Class like it was passed to 'jar.lang.Class()'
         *
         * @return {string} the classname that the Class was created with
         */
        getClassName: function() {
            return this._$clsName;
        },
        /**
         * Returns the name of the module in which the Class was created
         *
         * @return {string} the modulename
         */
        getModuleName: function() {
            return this._$modName;
        },

        getModuleBaseName: function() {
            var Class = this,
                moduleName = Class._$modName,
                baseName = Class._$modBaseName;

            if (!System.isSet(baseName)) {
                Class._$modBaseName = baseName = (useModule(moduleName) === Class) ? moduleName.substring(0, moduleName.lastIndexOf('.')) || moduleName : moduleName;
            }

            return baseName;
        },

        getModuleAccess: function() {
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
         * @return {boolean} whether this Class has a singleton
         */
        hasSingleton: function() {
            return !!this._$single;
        },
        /**
         * @return {Class} a reference to this Class for chaining
         */
        toAbstract: function() {
            this._$isAbstract = true;

            return this;
        },
        /**
         * @return {boolean} whether this Class is an abstract Class
         */
        isAbstract: function() {
            return this._$isAbstract;
        },
        /**
         * @return {Class} a reference to this Class for chaining
         */
        toFinal: function() {
            this._$isFinal = true;

            return this;
        },
        /**
         * @return {boolean} whether this Class is a final Class
         */
        isFinal: function() {
            return this._$isFinal;
        },
        /**
         * @return {Class} the SuperClass of this Class
         */
        getSuperClass: function() {
            return this._$superClass;
        },
        /**
         * @return {Array.<Class>} an array of all SubClasses
         */
        getSubClasses: function(includeSubclasses) {
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
        extendz: function(SuperClass) {
            var Class = this,
                superClassHiddenProtectedProps, message;


            if (!isClass(SuperClass)) {
                message = 'There is no SuperClass given!';
            }
            else if (SuperClass === Class) {
                message = 'The Class can\'t extend itself!';
            }
            else if (Class._$superClass) {
                message = 'The Class already has the SuperClass: "' + Class._$superClass.getHash() + '"!';
            }
            else if (Class._$instances.size() || Class._$subClasses.size()) {
                message = 'The Class already has instances or SubClasses!';
            }
            else if (SuperClass.isSubClassOf(Class)) {
                message = 'The given SuperClass: "' + SuperClass.getHash() + '" is already inheriting from this Class!';
            }
            else if (SuperClass.isFinal()) {
                message = 'The given SuperClass: "' + SuperClass.getHash() + '" is final and can\'t be extended!';
            }
            else {
                superClassHiddenProtectedProps = Classes[SuperClass.getHash()][protectedIdentifier];
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
                Obj.extend(Class, SuperClass);

                // Check if methods in the public and the protected prototype were overridden
                // and do it properly so that this.$super() works in instances
                Arr.each([Class.prototype, Class._$proto], overridePrototypeMethods, Class);
            }

            message && Class.logger.warn(message);

            return this;
        },
        /**
         * @return {Array.<Object>}
         */
        getInstances: function(includeSubclasses) {
            var instances = this._$instances.reduce(retrieveInstances, Arr());

            if (includeSubclasses) {
                instances = this._$subClasses.reduce(retrieveSubClassInstances, instances);
            }

            return instances;
        },

        getInstance: function(instanceHash) {
            var instanceData = this._$instances[instanceHash];

            return instanceData ? instanceData.instance : false;
        },
        /**
         * @param {function():void} destructor
         * @param {Object} instance
         * 
         * @return {Class}
         */
        addDestructor: function(destructor, instance) {
            var Class = this,
                destructors;

            if (isFunction(destructor)) {
                if (isA(instance, Class)) {
                    destructors = Class._$instances[instance.getHash()].$destructors;
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
        destruct: function(instance) {
            var Class = this,
                SuperClass = Class._$superClass,
                instances = Class._$instances,
                destructors,
                hash;

            if (isInstance(instance)) {
                hash = instance.getHash();

                if (isA(instance, Class) && hasOwn(instances, hash)) {
                    if (Class._$single === instance) {
                        Class._$single = null;
                    }

                    destructors = instances[hash].$destructors;

                    do {
                        destructors.mergeUnique(Classes[Class.getHash()][protectedIdentifier]._$destructors);
                        Class = Class.getSuperClass();
                    } while (Class);

                    while (destructors.length) {
                        proxyInstance(instance, destructors.shift());
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
                    delete Classes[SuperClass.getHash()][protectedIdentifier]._$subClasses[hash];
                }

                metaClassSandbox.remove(classBluePrint.join(Class.getClassName()));

                delete Classes[hash];

                return undefined;
            }
            /* */
        }
    });

    function overridePrototypeMethods(protoToOverride) {
        protoToOverride.each(this._$overrideMethod, this);
    }

    function createClassProxyMethod(method, methodName) {
        MetaClass.prototype[methodName] = function() {
            return proxyClass(this, method, arguments);
        };
    }

    ClassPrivilegedMethods.each(createClassProxyMethod);

    Obj.merge(MetaClass.prototype, {
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
                classHash = Class.getHash(),
                classHiddenProtectedProps = Classes[classHash][protectedIdentifier],
                instances = classHiddenProtectedProps._$instances,
                instanceHashPrefix, instanceHash, construct, returnValue;

            // Class._$isProto is true when a SubClass is inheriting over SubClass.extendz(SuperClass)
            // In this case we don't need the constructor to be executed neither do we need a new instance to be saved
            if (classHiddenProtectedProps._$isProto) {
                returnValue = instance;
            }
            // If Class is an abstract Class return an empty Object
            // Returning undefined won't work because of the function behaviour in combination with 'new'
            else if (classHiddenProtectedProps._$isAbstract) {
                logger.warn('You can\'t create a new instance of an abstract Class.');

                returnValue = {};
            }
            // If a Singleton exists return it and skip the rest
            else if (classHiddenProtectedProps._$single) {
                logger.warn('You can\'t create a new instance of this Class.');

                returnValue = classHiddenProtectedProps._$single;
            }
            else {
                if (isA(instance, Class) && !isFunction(instance.getHash)) {
                    // If we have a new instance that is not stored in the instances yet
                    // create a unique hash for it and store a reference under this hash for later use.
                    // This hash is also used to store the private/protected properties/methods.
                    //
                    // Note: If an instance isn't used anymore this reference has to be deleted over the destructor of the instance
                    // Otherwise this could lead to memory leaks if there are too many instances
                    instanceHashPrefix = 'Object #<' + classHiddenProtectedProps._$clsName + '#';

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
                        _$: classHiddenProtectedProps._$proto.copy(),
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

                    classHiddenProtectedProps._$skipCtor = true;
                    instance = new Class();
                    classHiddenProtectedProps._$skipCtor = false;

                    returnValue = instance;
                }

                construct = instance.construct;

                if (!classHiddenProtectedProps._$skipCtor && construct) {
                    construct.apply(instance, args);
                }
            }

            return returnValue;
        },

        toString: function() {
            return this.getHash();
        },
        /**
         * Returns a singleton or creates one
         * if it doesn't already exist
         * It doesn't use 'proxyClass()' for the same reason as 'Class.New()'
         *
         * @return {Object} the created or existing singleton
         */
        singleton: function() {
            var Class = this,
                classHiddenProtectedProps = Classes[Class.getHash()][protectedIdentifier];

            classHiddenProtectedProps._$single = classHiddenProtectedProps._$single || Class.apply(Class, arguments);

            return classHiddenProtectedProps._$single;
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
            return this.getSubClasses(true).length > 0;
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
            return this.getModuleAccess().some(function isModuleNameStartingWith(moduleAccess) {
                return moduleName.indexOf(moduleAccess) === 0;
            });
        },

        createSubClass: function(name, proto, staticProperties) {
            return ClassFactory(name, proto, staticProperties).extendz(this);
        },

        createAbstractSubClass: function(name, proto, staticProperties) {
            var SubClass = this.createSubClass(name, proto, staticProperties);

            return SubClass ? SubClass.toAbstract() : undefined;
        },

        createFinalSubClass: function(name, proto, staticProperties) {
            var SubClass = this.createSubClass(name, proto, staticProperties);

            return SubClass ? SubClass.toFinal() : undefined;
        }
    });

    /**
     * This method is used to add methods like 'implementz' or 'mixin'
     * to all Classes, when the module is loaded
     * Added methods are automatically available to every Class
     *
     * @param {string|Object.<string, function()>} prop
     * @param {function()|undefined} value
     */
    function addStatic(prop, value) {
        var props = {};

        if (System.isObject(prop)) {
            props = prop;
        }
        else {
            props[prop] = value;
        }

        Obj.extend(MetaClass.prototype, props);
    }

    /**
     * 
     * @param {String} moduleName
     * @param {String} className
     * 
     * @return {Class}
     */
    function getClassFromModule(moduleName, className) {
        var module, Class;

        if (System.isString(moduleName)) {
            module = useModule(moduleName);
            Class = (module && className) ? module[className] : module;
        }

        return isClass(Class) ? Class : null;
    }

    function abstractClass(name, proto, staticProperties) {
        return ClassFactory(name, proto, staticProperties).toAbstract();
    }

    function finalClass(name, proto, staticProperties) {
        return ClassFactory(name, proto, staticProperties).toFinal();
    }

    /**
     * @param {Class} Class
     *
     * @return {boolean}
     */
    function isClass(Class) {
        return isA(Class, MetaClass);
    }

    /**
     * @param {Object} instance
     *
     * @return {boolean}
     */
    function isInstance(instance) {
        return instance && isClass(instance.Class) && isA(instance, instance.Class);
    }

    /**
     * @param {string} classHashOrName
     *
     * @return {Class}
     */
    function getClass(classHashOrName) {
        return (Classes[classHashOrName] || Classes[createClassHash(classHashOrName)] || {}).Class;
    }

    /**
     *
     * @return {Array.<Class>}
     */
    function getClasses() {
        return Classes.reduce(retrieveClass, Arr());
    }

    /**
     * @param {(Class|string)} ClassOrHash
     * 
     * @return {(Array.<Object>|undefined)}
     */
    function getInstances(ClassOrHash, includeSubclasses) {
        if (!isClass(ClassOrHash)) {
            ClassOrHash = getClass(ClassOrHash);
        }

        return ClassOrHash ? ClassOrHash.getInstances(includeSubclasses) : undefined;
    }

    function buildAccessLookupPrototype(accessIdentifierAlias, accessIdentifier) {
        var Class = this,
            classHidden = Classes[Class.getHash()],
            proto = Class.prototype,
            hiddenProto = classHidden[accessIdentifier][accessIdentifier + 'proto'];

        if (hasOwn(proto, accessIdentifier) || hasOwn(proto, accessIdentifierAlias)) {
            Obj.each(proto[accessIdentifier] || proto[accessIdentifierAlias], function(value, property) {
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
     * 
     * @return {function()} Class
     */
    function ClassFactory(name, proto, staticProperties) {
        var classHash = createClassHash(name),
            Class;

        if (rClass.test(name) && !hasOwn(Classes, classHash)) {
            Class = metaClassSandbox.add(classBluePrint.join(name));

            Obj.merge(Class, {
                // Extend the prototype with some methods defined in Obj (see module jar.lang.Object)
                prototype: Obj.from(proto || {}).extend({
                    constructor: Class,

                    Class: Class,

                    toString: function() {
                        return this.getHash();
                    }
                }),

                logger: new System.Logger(classHash),

                getHash: function() {
                    return classHash;
                }
            }, staticProperties);

            // Store a reference of the Class and define some protected properties
            Classes[classHash] = Obj.from({
                Class: Class,

                $inPrivileged: false,

                _$: Obj.from({
                    _$clsName: name,

                    _$modName: getCurrentModuleName(),

                    _$subClasses: Obj(),

                    _$proto: Obj.from({
                        $proxy: createProxyFor('class', {
                            Class: Class
                        })
                    }),

                    _$instances: Obj(),

                    _$destructors: Arr()
                }).extend(ClassProtectedProperties),
                // TODO
                _: Obj.from({
                    _proto: Obj()
                })
            });

            accessIdentifiers.each(buildAccessLookupPrototype, Class);

            buildPrivilegedMethods(Class);
        }
        else {
            classFactoryLogger.warn(MSG_INVALID_OR_EXISTING_CLASS, {
                name: name
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

        getClassFromModule: getClassFromModule,

        Abstract: abstractClass,

        Final: finalClass,

        createProxy: createProxy
    });

    return ClassFactory;
});