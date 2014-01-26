JAR.register({
    MID: 'jar.lang.Class',
    deps: ['System', '..' /*(jar)*/ , '.Object', '.Array']
}, function(System, jar, Obj, Arr) {
    'use strict';

    var lang = this,
        isA = System.isA,
        isFunction = System.isFunction,
        getCurrentModuleName = jar.getModuleName,
        useModule = jar.use,
        sandboxDomain = '__SYSTEM__.Class',
        MetaClass = lang.sandbox('Function', sandboxDomain),
        protectedIdentifier = '_$',
        privateIdentifier = '_',
        accessIdentifiers = Arr(protectedIdentifier, privateIdentifier),
        excludeOverride = Arr('Class', 'constructor', 'getHash', '$proxy'),
        rClass = /^[A-Z]\w+$/,
        Classes = Obj(),
        classBluePrint = ['(function() {var _', '=function ', '() { return this instanceof _', ' ? _', '.New(this,arguments):_', '.New.apply(_', ',arguments);};return _', ';})();'],
        MSG_ALREADY_DESTRUCTED = 0,
        MSG_INVALID_OR_EXISTING_CLASS = 1,
        MSG_WRONG_CLASS = 2,
        MSG_WRONG_CLASS_AND_MODULE = 3,
        MSG_WRONG_CONTEXT = 4,
        MSG_WRONG_MODULE = 5,
        ClassPrivilegedMethods, ClassProtectedProps, classFactoryLogger;

    classFactoryLogger = (function classFactoryLoggerSetup() {
        var classFactoryMessageTemplates = [],
            proxyFailed = 'Proxy failed! ',
            instanceMustBe = '{{instanceHash}} must be ',
            instanceOfClass = 'an instance of {{classHash}}',
            inModules = 'in one of the following modules: {{moduleNames}}, but is in module {{moduleName}}';

        classFactoryMessageTemplates[MSG_ALREADY_DESTRUCTED] = proxyFailed + '{{hash}} was already destructed!';
        classFactoryMessageTemplates[MSG_INVALID_OR_EXISTING_CLASS] = 'Illegal or already existing Classname: {{name}}';
        classFactoryMessageTemplates[MSG_WRONG_CLASS] = proxyFailed + instanceMustBe + instanceOfClass + '!';
        classFactoryMessageTemplates[MSG_WRONG_CLASS_AND_MODULE] = proxyFailed + instanceMustBe + instanceOfClass + ' or ' + inModules + '!';
        classFactoryMessageTemplates[MSG_WRONG_CONTEXT] = proxyFailed + 'Method was called in wrong context!';
        classFactoryMessageTemplates[MSG_WRONG_MODULE] = proxyFailed + instanceMustBe + inModules + '!';

        return System.getCustomLogger(getCurrentModuleName(), classFactoryMessageTemplates);
    })();

    function proxyClass(Class, method, args) {
        var classHash = Class.getHash(),
            ClassHidden = Classes[classHash],
            result;

        if (ClassHidden) {
            result = proxy(Class, ClassHidden, method, args);
        }
        else {
            proxyDestructed(classHash);
        }

        return result;
    }

    function proxyInstance(Instance, method, args) {
        var Class = Instance.Class,
            classHash = Class.getHash(),
            ClassHidden = Classes[classHash],
            ClassHiddenProtectedProps, instanceHash, InstanceHidden, result;

        if (ClassHidden) {
            ClassHiddenProtectedProps = ClassHidden[protectedIdentifier];
            instanceHash = Instance.getHash();
            InstanceHidden = ClassHiddenProtectedProps._$Instances[instanceHash];

            if (InstanceHidden) {
                result = proxy(Instance, InstanceHidden, method, args);
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

    function proxy(InstanceOrClass, InstanceOrClassHidden, method, args) {
        var result, inPrivileged = InstanceOrClassHidden.$inPrivileged;

        inPrivileged || prepareBeforeProxy(InstanceOrClass, InstanceOrClassHidden);

        result = method.apply(InstanceOrClass, args || []);

        inPrivileged || cleanupAfterProxy(InstanceOrClass, InstanceOrClassHidden);

        return result;
    }

    function prepareBeforeProxy(InstanceOrClass, InstanceOrClassHidden) {
        var protectedProps = InstanceOrClassHidden[protectedIdentifier];

        InstanceOrClassHidden.$inPrivileged = true;

        Obj.extend(InstanceOrClass, protectedProps);
    }

    function cleanupAfterProxy(InstanceOrClass, InstanceOrClassHidden) {
        var protectedProps = InstanceOrClassHidden[protectedIdentifier];

        InstanceOrClassHidden.$inPrivileged = false;

        protectedProps.each(function(value, prop) {
            if (InstanceOrClass[prop] !== value) {
                protectedProps[prop] = InstanceOrClass[prop];
            }

            delete InstanceOrClass[prop];
        });
    }

    function proxyDestructed(destructedHash) {
        classFactoryLogger(MSG_ALREADY_DESTRUCTED, 'error', {
            hash: destructedHash
        });
    }

    function createProxyFor(proxyType, proxyData) {
        var Class = proxyData.Class,
            moduleName = proxyData.module,
            isProxyDataCollected = false;

        function innerProxy() {
            var Instance, method, args, result;

            if (proxyType === 'instance') {
                Instance = this,
                method = proxyData.method,
                args = arguments;
            }
            else {
                Instance = arguments[0];
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

            if (isProxyAllowed(Instance, Class, moduleName)) {
                result = proxyInstance(Instance, method, args);
            }

            return result;
        }

        return innerProxy;
    }

    function isProxyAllowed(Instance, Class, moduleName) {
        var canProxy = false,
            moduleNames = [],
            instanceHash, InstanceClass, NextClass, failData, failMessage, nextModuleName;

        if (isInstance(Instance)) {
            instanceHash = Instance.getHash();

            failData = Obj.from({
                instanceHash: instanceHash
            });

            if (moduleName) {
                InstanceClass = Instance.Class;
                NextClass = Class;

                canProxy = isClassInBundle(InstanceClass, moduleName);

                while (!canProxy && isClass(NextClass)) {
                    nextModuleName = NextClass.getModuleBaseName();
                    canProxy = isClassInBundle(InstanceClass, nextModuleName);
                    NextClass = NextClass.getSuperClass();

                    canProxy || moduleNames.push(nextModuleName);
                }

                if (!canProxy) {
                    moduleName === moduleNames[0] || moduleNames.unshift(moduleName);

                    failMessage = MSG_WRONG_MODULE;
                    failData.extend({
                        moduleName: InstanceClass.getModuleBaseName(),
                        moduleNames: moduleNames.join(', ')
                    });
                }
            }

            if (!canProxy && isClass(Class)) {
                if (isA(Instance, Class)) {
                    canProxy = true;
                }
                else {
                    failMessage = moduleName ? MSG_WRONG_CLASS_AND_MODULE : MSG_WRONG_CLASS;
                    failData.extend({
                        classHash: Class.getHash()
                    });
                }
            }
        }
        else {
            failMessage = MSG_WRONG_CONTEXT;
        }

        canProxy || classFactoryLogger(failMessage, 'error', failData);

        return canProxy;
    }

    function isClassInBundle(Class, moduleName) {
        var inBundle = false;

        while (Class && !inBundle) {
            if (moduleName.indexOf(Class.getModuleBaseName()) === 0) {
                inBundle = true;
            }
            else {
                Class = Class.getSuperClass();
            }
        }

        return inBundle;
    }

    function createClassHash(name) {
        return 'Class #<' + name + '>';
    }

    function retrieveClass(allClasses, classData) {
        allClasses.push(classData.Class);

        return allClasses;
    }

    function retrieveSubclasses(subclasses, subclassData) {
        var SubClass = subclassData.Class;

        subclasses.push(SubClass);
        subclasses.merge(SubClass.getSubClasses());

        return subclasses;
    }

    function retrieveInstances(instances, instanceData) {
        instances.push(instanceData.Instance);

        return instances;
    }

    function retrieveSubclassInstances(instances, subclassData) {
        return instances.merge(subclassData.Class.getInstances(true));
    }

    function destructInstance(Instance) {
        Instance.Class.destruct(Instance);
    }

    function destructSubclass(SubClass) {
        SubClass.destruct();
    }

    function addPropertiesToPrototype(proto, properties, accessIdentifier) {
        Obj.each(properties, function(value, property) {
            proto[accessIdentifier + property] = value;
        });
    }

    ClassProtectedProps = Obj.from({
        _$isAbstract: false,

        _$isFinal: false,

        _$single: null,

        _$isProto: false,

        _$skipCtor: false,

        _$superClass: null,
        /**
         * @param {string} methodName
         * @param {function()} method
         */
        _$overrideMethod: function(methodName, method) {
            var Class = this,
                ClassHiddenProto = Class._$proto,
                protoToOverride,
                SuperClass = Class._$superClass,
                SuperClassHiddenProto,
                superProto, superMethod;

            // Never override Class()-, constructor()- and getHash()-methods
            if (SuperClass && isFunction(method) && excludeOverride.indexOf(methodName) === -1) {
                SuperClassHiddenProto = Classes[SuperClass.getHash()][protectedIdentifier]._$proto;

                if (methodName in SuperClass.prototype) {
                    protoToOverride = Class.prototype;
                    superProto = SuperClass.prototype;
                }
                else if (methodName in SuperClassHiddenProto) {
                    protoToOverride = ClassHiddenProto;
                    superProto = SuperClassHiddenProto;
                }

                // check if the method is override a method in the SuperClass.prototype and is not already overridden in the current Class.prototype
                if (superProto && isFunction(superProto[methodName]) && superProto[methodName] !== method && (!protoToOverride.hasOwn(methodName) || protoToOverride[methodName] === method)) {
                    superMethod = function() {
                        return superProto[methodName].apply(this, arguments);
                    };

                    protoToOverride[methodName] = function() {
                        var Instance = this,
                            result, currentSuper;

                        // if this.$super is already set store it for later
                        if (Instance.$super) {
                            currentSuper = Instance.$super;
                        }

                        // create a new temporary this.$super that uses the method of the SuperClass.prototype
                        Instance.$super = superMethod;

                        result = method.apply(Instance, arguments);

                        // restore or delete this.$super
                        if (currentSuper) {
                            Instance.$super = currentSuper;
                        }
                        else {
                            delete Instance.$super;
                        }

                        return result;
                    };

                    // Fix vor jar.lang.Interface
                    // Interface checks method.length property for validation
                    // either set args in Interface to undefined or supply method.arity as fallback
                    protoToOverride[methodName].arity = method.length || method.arity || 0;
                }
            }
        }
    });

    ClassPrivilegedMethods = Obj.from({
        /**
         * Returns the name of the Class like it was passed to 'jar.lang.Class()'
         * This is probably obsolete - now that we can access it through Class.name (readonly)
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
                Class._$modBaseName = baseName = (useModule(moduleName) === Class) ? moduleName.substring(0, moduleName.lastIndexOf('.')) : moduleName;
            }

            return baseName;
        },

        logger: function(data, type, values) {
            this._$logger(data, type, values);
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
        getSubClasses: function() {
            return this._$subClasses.reduce(retrieveSubclasses, Arr());
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
                classHash = Class.getHash(),
                superClassHash, SuperClassHiddenProtectedProps, message;


            if (!isClass(SuperClass)) {
                message = 'There is no SuperClass given!';
            }
            else if (Class._$superClass) {
                message = 'The Class already has the SuperClass: "' + Class._$superClass.getHash() + '"!';
            }
            else if (SuperClass === Class) {
                message = 'The Class can\'t extend itself!';
            }
            else {
                superClassHash = SuperClass.getHash();

                if (SuperClass.isSubClassOf(Class)) {
                    message = 'The given SuperClass: "' + superClassHash + '" is already inheriting from this Class!';
                }
                else {
                    SuperClassHiddenProtectedProps = Classes[superClassHash][protectedIdentifier];

                    if (SuperClassHiddenProtectedProps._$isFinal) {
                        message = 'The given SuperClass: "' + superClassHash + '" is final and can\'t be extended!';
                    }
                    else {
                        // add SuperClass reference
                        Class._$superClass = SuperClass;
                        // extend own private/protected prototype with that of the SuperClass
                        Class._$proto.extend(SuperClassHiddenProtectedProps._$proto);
                        // add SubClass reference in the SuperClass
                        SuperClassHiddenProtectedProps._$subClasses[classHash] = Classes[classHash];

                        // Prevent the default constructor and objectHash-generation to be executed
                        SuperClassHiddenProtectedProps._$isProto = true;
                        // Create a new Instance of the SuperClass and merge it with the current prototype
                        // to override in the correct order
                        Class.prototype = new SuperClass().merge(Class.prototype);
                        // end inheriting
                        SuperClassHiddenProtectedProps._$isProto = false;

                        // extend Class with static methods of SuperClass
                        Obj.extend(Class, SuperClass);

                        // Check if methods in the public and the private prototype were overridden
                        // and do it properly so that this.$super() works in Instances
                        Arr.each([Class.prototype, Class._$proto], function(protoToOverride) {
                            protoToOverride.each(function(value, prop) {
                                isFunction(value) && Class._$overrideMethod(prop, value);
                            });
                        });

                        // protected properties are copied once for every Instance on creation
                        // if extendz was called after an Instance was created
                        // we have to re-evaluate these properties
                        // TODO: overridden methods must be merged while properties must only be extended
                        Class._$Instances.each(function(instanceData) {
                            accessIdentifiers.each(function(accessIdentifier) {
                                var InstanceHiddenProps = instanceData[accessIdentifier];

                                Class[accessIdentifier + 'proto'].each(function(value, property) {
                                    if (isFunction(value) || !(property in InstanceHiddenProps)) {
                                        InstanceHiddenProps[property] = value;
                                    }
                                });
                            });
                        });
                    }
                }
            }

            message && Class.logger(message, 'warn');

            return this;
        },
        /**
         * @return {Array.<Object>}
         */
        getInstances: function(includeSubClasses) {
            var instances = this._$Instances.reduce(retrieveInstances, Arr());

            if (includeSubClasses) {
                instances = this._$subClasses.reduce(retrieveSubclassInstances, instances);
            }

            return instances;
        },

        getInstance: function(InstanceHash) {
            var InstanceData = this._$Instances[InstanceHash];

            return InstanceData ? InstanceData.Instance : false;
        },
        /**
         * @param {function():void} destructor
         * @param {Instance} Instance
         * 
         * @return {Class}
         */
        addDestructor: function(destructor, Instance) {
            var Class = this,
                destructors;

            if (isFunction(destructor)) {
                if (isA(Instance, Class)) {
                    destructors = Class._$Instances[Instance.getHash()].$destructors;
                }
                else {
                    destructors = Class._$destructors;
                }

                destructors.push(destructor);
            }

            return Class;
        },
        /**
         * @param {Instance} Instance
         *
         * @return {Class}
         */
        destruct: function(Instance) {
            var Class = this,
                SuperClass = Class._$superClass,
                Instances = Class._$Instances,
                destructors,
                hash;

            if (isInstance(Instance)) {
                hash = Instance.getHash();

                if (isA(Instance, Class) && (hash in Instances)) {
                    if (Class._$single === Instance) {
                        Class._$single = null;
                    }

                    destructors = Instances[hash].$destructors;

                    do {
                        destructors.mergeUnique(Classes[Class.getHash()][protectedIdentifier]._$destructors);
                        Class = Class.getSuperClass();
                    } while (Class);

                    while (destructors.length) {
                        proxyInstance(Instance, destructors.shift());
                    }

                    delete Instances[hash];
                }
                else if (Instance.Class !== Class) {
                    Instance.Class.destruct(Instance);
                }
                else {
                    Class.logger('"' + hash + '" is already destructed', 'warn');
                }

                return this;
            }
            /* */
            else if (Instance === Class) {
                hash = Class.getHash();

                Class.getInstances().each(destructInstance);

                Class.getSubClasses().each(destructSubclass);

                if (SuperClass) {
                    delete Classes[SuperClass.getHash()][protectedIdentifier]._$subClasses[hash];
                }

                lang.unsandbox(classBluePrint.join(Class.getClassName()), sandboxDomain);

                delete Classes[hash];

                return undefined;
            }
            /* */
        },

        getProtectedInitialValue: function(property) {
            var value = this._$proto[protectedIdentifier + property];

            return !isFunction(value) ? value : undefined;
        }
    });

    function createClassProxyMethod(method, methodName) {
        MetaClass.prototype[methodName] = function() {
            return proxyClass(this, method, arguments);
        };
    }

    ClassPrivilegedMethods.each(createClassProxyMethod);

    Obj.merge(MetaClass.prototype, {
        /**
         * Initiates a new Instance
         * Although it accesses hidden properties on the Class
         * it doesn't use 'proxyClass()' to achieve this
         * The reason is that this method calls 'construct()' on the Instance
         * so there would be a possibility to manipulate the hidden Class-properties
         *
         * @param {(Instance|Array)} Instance
         * @param {Array} args
         * 
         * @return {(Instance|Object|undefined)} Instance if singleton exists, called directly or via Class.extendz, empty object if abstract, else undefined
         */
        New: function(Instance, args) {
            var Class = this,
                classHash = Class.getHash(),
                classHiddenProtectedProps = Classes[classHash][protectedIdentifier],
                Instances = classHiddenProtectedProps._$Instances,
                objectHashPrefix, objectHash, construct, returnValue;

            // Class._$isProto is true when a SubClass is inheriting over SubClass.extendz(SuperClass)
            // In this case we don't need the constructor to be executed neither do we need a new Instance to be saved
            if (classHiddenProtectedProps._$isProto) {
                returnValue = Instance;
            }
            // If Class is an abstract Class return an empty Object
            // Returning undefined won't work because of the function behaviour in combination with 'new'
            else if (classHiddenProtectedProps._$isAbstract) {
                Class.logger('You can\'t create a new Instance of an abstract Class.', 'warn');

                returnValue = {};
            }
            // If a Singleton exists return it and skip the rest
            else if (classHiddenProtectedProps._$single) {
                Class.logger('You can\'t create a new Instance of this Class.', 'warn');

                returnValue = classHiddenProtectedProps._$single;
            }
            else {
                if (isA(Instance, Class) && !isFunction(Instance.getHash)) {
                    // If we have a new Instance that is not stored in the Instances yet
                    // create a unique hash for it and store a reference under this hash for later use.
                    // This hash is also used to store the private/protected properties/methods.
                    //
                    // Note: If an Instance isn't used anymore this reference has to be deleted over the destructor of the Instance
                    // Otherwise this could lead to memory leaks if there are too many Instances
                    objectHashPrefix = 'Object #<' + classHiddenProtectedProps._$clsName + '#';

                    do {
                        objectHash = objectHashPrefix + lang.generateHash('xx-x-x-x-xxx') + '>';
                    }
                    while (objectHash in Instances);

                    // !!!IMPORTANT: never delete or override this method!!!
                    Instance.getHash = function() {
                        return objectHash;
                    };

                    Instances[objectHash] = {
                        Instance: Instance,

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
                    // So we have to create a new Instance and return it

                    // Copy values from arguments into an array. Just using arguments seemes to be a problem
                    // (at least in chrome 31.0.1650.57 m, but it seems to be the normal case in all browsers),
                    // because when we reassign Instance, which is arguments[0], arguments is reflecting the change and so does args
                    // resulting in a wrong value being passed to Instance.construct()
                    //
                    // Example: SomeClass.New(arg1, arg2)
                    //
                    // arguments would first be:
                    //	{0: arg1 (Instance), 1: arg2 (args)}
                    //
                    // after reassinging Instance, arguments is:
                    //	{0: InstanceOfSomeClass (Instance), 1: arg2 (args)}
                    //
                    // resulting in:
                    //	InstanceOfSomeClass.construct(InstanceOfSomeClass, arg2)
                    //
                    // instead of:
                    //	InstanceOfSomeClass.construct(arg1, arg2)
                    args = Arr.fromArrayLike(arguments);

                    classHiddenProtectedProps._$skipCtor = true;
                    Instance = new Class();
                    classHiddenProtectedProps._$skipCtor = false;

                    returnValue = Instance;
                }

                construct = Instance.construct;

                if (!classHiddenProtectedProps._$skipCtor && construct) {
                    construct.apply(Instance, args);
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
         * @return {Instance} the created or existing singleton
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

        createSubClass: function(name, proto, staticProperties) {
            var Class = this,
                SubClass;

            if (Class.isFinal()) {
                Class.logger('The Class is final and can\'t be extended!', 'warn');
            }
            else {
                SubClass = ClassFactory(name, proto, staticProperties).extendz(Class);
            }

            return SubClass;
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
     * @param {Instance} Instance
     *
     * @return {boolean}
     */
    function isInstance(Instance) {
        return Instance && isClass(Instance.Class) && isA(Instance, Instance.Class);
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
     * @return {(Array.<Instance>|undefined)}
     */
    function getInstances(ClassOrHash, includeSubClasses) {
        if (!isClass(ClassOrHash)) {
            ClassOrHash = getClass(ClassOrHash);
        }

        return ClassOrHash ? ClassOrHash.getInstances(includeSubClasses) : undefined;
    }

    function createProxy() {
        return createProxyFor('module', {
            module: getCurrentModuleName()
        });
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
        var Class, classHash = createClassHash(name),
            ClassHidden, privilegedFunction;

        // Extend the prototype with some methods defined in Obj (see module jar.lang.Object)
        proto = Obj.from(proto || {});

        if (rClass.test(name) && !(classHash in Classes)) {

            Class = lang.sandbox(classBluePrint.join(name), sandboxDomain);

            Class.getHash = function() {
                return classHash;
            };

            System.isObject(staticProperties) && Obj.extend(Class, staticProperties);

            // Store a reference of the Class and define some protected properties
            ClassHidden = Classes[classHash] = Obj.from({
                Class: Class,

                $inPrivileged: false,

                _$: Obj.from({
                    _$clsName: name,

                    _$logger: System.getCustomLogger(classHash),

                    _$modName: getCurrentModuleName(),

                    _$modBaseName: null,

                    _$subClasses: Obj(),

                    _$proto: Obj.from({
                        $proxy: createProxyFor('class', {
                            Class: Class
                        })
                    }),

                    _$Instances: Obj(),

                    _$destructors: Arr()
                }).extend(ClassProtectedProps),
                // TODO
                _: Obj.from({
                    _proto: Obj()
                })
            });

            /**
             * Experimental create Classes with public, protected and privileged methods/properties
             * Protected methods/properties in a SuperClass can be accessed in a SubClass
             * 
             */
            accessIdentifiers.each(function(accessIdentifier) {
                if (accessIdentifier in proto) {
                    addPropertiesToPrototype(ClassHidden[accessIdentifier][accessIdentifier + 'proto'], proto[accessIdentifier], accessIdentifier);

                    delete proto[accessIdentifier];
                }
            });

            if ('$' in proto) {
                proto.extend(Obj.map(proto.$, function(maybeMethod) {
                    if (isFunction(maybeMethod)) {
                        privilegedFunction = createProxyFor('instance', {
                            method: maybeMethod,
                            Class: Class
                        });

                        privilegedFunction.arity = maybeMethod.length || maybeMethod.arity || 0;

                        return privilegedFunction;
                    }

                    return maybeMethod;
                }));

                delete proto.$;
            }

            Class.prototype = proto.extend({
                constructor: Class,

                Class: Class,

                toString: function() {
                    return this.getHash();
                }
            });
        }
        else {
            classFactoryLogger(MSG_INVALID_OR_EXISTING_CLASS, 'warn', {
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