JAR.register({
	MID: "jar.lang.Class",
	deps: [".Object", ".Array", ".Function"],
	bundle: ["Abstract"]
}, function(Obj, Arr, Fn) {
	var lang = this, generateGuid, Constructor = lang.copyNative("Function"), ConstructorPrivates, Class, Classes = {}, proxy, init;
	
    generateGuid = (function() {
		var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        
		return function() {
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		};
    })();
	
	proxy = function(InstanceOrClass, method, args) {
		var result, hashValue = InstanceOrClass.getHash(), privates, protoPrivates, inPrivileged = false;
		
		if(hashValue in Classes) {
			privates = Classes[hashValue]._;
			protoPrivates = Classes[hashValue].__;
			
		}
		else {
			privates = Classes[InstanceOrClass.Class.getHash()].Instances[hashValue]._;
		}
		
		if(privates) {
			InstanceOrClass.extend(privates);
			if(privates.inPrivileged) {
				inPrivileged = true;
				delete InstanceOrClass.inPrivileged;
			}
			else {
				privates.inPrivileged = true;
			}
			if(protoPrivates) {
				InstanceOrClass.prototype.extend(protoPrivates);
			}
		}
		
		result = method.apply(InstanceOrClass, args || []);
		
		if(privates && !inPrivileged) {
			delete privates.inPrivileged;
			privates.each(function(prop, value) {
				if(InstanceOrClass[prop] !== value) {
					privates[prop] = InstanceOrClass[prop];
				}
				delete InstanceOrClass[prop];
			});
			if(protoPrivates) {
				protoPrivates.each(function(prop, value) {
					if(InstanceOrClass.prototype[prop] === value) {
						delete InstanceOrClass.prototype[prop];
					}
				});
			}
		}
		
		return result;
	};
	
	ConstructorPrivates = {
		isSingleton: function() {
			return !!this._singleton;
		},
		
		singleton: function() {
            var singleton = this._singleton, Class = this;
            this._singleton = singleton || new Class();
            singleton || this._singleton.constructor.apply(this._singleton, arguments);
            return this._singleton;
        },
		
		toAbstract: function() {
			this._isAbstract = true;
			return this;
		},
		
		isAbstract: function() {
			return this._isAbstract;
		},
		
		getSuperClass: function() {
			return this._superClass;
		},
		
		getClassName: function() {
			return this._className;
		},
		
		getSubClasses: function() {
			var SubClasses = Arr();
			
			this._subClasses.each(function(hash, SubClass) {
				SubClasses.push(SubClass.self);
			});
			
			return SubClasses;
		}
	};
	
	Constructor.prototype.extend({
		initInstance: function(Instance, args) {
			var TheClass = this, classHash = TheClass.getHash(), ClassHidden = Classes[classHash],
				Instances = ClassHidden.Instances, autoNew = false;
			
				
	        if(TheClass.isAbstract()) {
	            lang.debug("Abstract " + classHash + ": You can't create a new instance of an abstract Class.", "warn");
	            return {};
	        }
	        else if(TheClass.isSingleton()) {
	            lang.debug("Singleton " + classHash + ": You can't create a new instance of this Class.", "warn");
	            lang.debug("There already exist a singleton.", "warn");
	            return TheClass.singleton();
	        }
			else if(Class.isInstance(Instance) && !(lang.isFunction(Instance.getHash) && Instance.getHash() in Instances)) {
				var InstanceHidden, ObjectName, objectHash;

	            ObjectName = "Object #<" + TheClass.getClassName() + "#";
	            
				do {
					objectHash = ObjectName + generateGuid() + ">";
				}
				while(objectHash in Instances);
				
	            Instance.getHash = function() {
					return objectHash;
	            };
	            
	            InstanceHidden = Instances[objectHash] = {self: Instance};
	            
	            if(ClassHidden.__) {
					InstanceHidden._ = ClassHidden.__.copy();
				}
				
				TheClass = TheClass.getSuperClass();
				if(TheClass) {
					InstanceHidden._ = InstanceHidden._ || Obj();
					while(TheClass) {
						InstanceHidden._.extend(Classes[TheClass.getHash()].__);
						TheClass = TheClass.getSuperClass();
					}
	            }
	        }
	        else {
				autoNew = true;
				args = Instance;
				Instance = new TheClass();
	        }
            Instance.constructor.apply(Instance, args);
            
			return autoNew ? Instance : undefined;
	    },
	    
		singleton: function() {
			return proxy(this, ConstructorPrivates.singleton, arguments);
        },
		
		isSingleton: function() {
			return proxy(this, ConstructorPrivates.isSingleton);
		},
		
		toAbstract: function() {
			return proxy(this, ConstructorPrivates.toAbstract);
		},
		
		isAbstract: function() {
			return proxy(this, ConstructorPrivates.isAbstract);
		},
		
		getSuperClass: function() {
			return proxy(this, ConstructorPrivates.getSuperClass);
		},
		
		hasSuperClass: function() {
			return !!this.getSuperClass();
		},
		
		getSubClasses: function() {
			return proxy(this, ConstructorPrivates.getSubClasses);
		},
		
		hasSubClasses: function() {
			return this.getSubClasses().length > 0;
		},
		
		getInstances: function() {
			var Instances = [];
			
			Classes[this.getHash()].Instances.each(function(hash, Instance) {
				Instances.push(Instance.self);
			});
			
			this.getSubClasses().each(function(SubClass) {
				Instances = Instances.concat(SubClass.getInstances());
			});
			
			return Arr.fromNative(Instances);
		},
		
		getClassName: function() {
			return proxy(this, ConstructorPrivates.getClassName);
		},
		
		/**
		 * Method to mimick classical inheritance in JS
		 * It uses prototypal inheritance inside but makes developing easier
		 * To call the parent-constructor use this.$super(arg1, arg2, ...)
		 * To call any other parent-method use this.superCall(methodName, arguments)
		 *
		 * Note: The SuperClass has to be created with jar.lang.Class() 
		 * or at least use jar.lang.Object for the creation of the prototype
		 * 
		 * Example:
		 * 
		 *		var MySubClass = jar.lang.Class("MySubClass", {
		 *			myMethod: function(param) {
		 *				// do something...
		 *			}
		 *		}).extendz(MyClass);
		 * 
		 * 
		 * @param Object SuperClass
		 * 
		 * @return Object
		 */		
		extendz: function(SuperClass) {
			if(Class.isClass(SuperClass)) {
				var superProto = SuperClass.prototype,
	                superIsExecuting = {}, classHash = this.getHash(),
	                Proto = function() {};
               
				Classes[classHash]._._superClass = SuperClass;
				Classes[SuperClass.getHash()]._._subClasses[classHash] = Classes[classHash];
                // We assign the prototype of the SuperClass to another Constructor
                // This is to prevent code in the real Constructor to be executed
                Proto.prototype = superProto;
                // Create a new superinstance of the SuperClass, merge it with the current prototype
                // and finally merge it with the superCall-methods to overwrite in the correct order
                this.prototype = new Proto().merge(this.prototype).merge({
					/**
					 * Method to call a super-method of the SuperClass in the context of the current instance
					 * The context is optional and will be automatically set to the right context
					 * It handles the delegation of the superCall up the prototype-chain
					 * and steps over the methods that are currently executing or equal to the current method
					 * 
					 * 
					 * @param String methodName
					 * @param Array args
					 * @param Object context
					 * 
					 * @return the result of the superCall
					 */
                    superCall: function(methodName, args, context) {
                        var result, objectHash, superMethods;
                        
                        args = Arr.fromArgs(args) || [];
                        // Set the context for the execution
                        context = context || this;
                        objectHash = context.getHash();
                        superMethods = superIsExecuting[objectHash] = superIsExecuting[objectHash] || {};

						/**
						 * If the super-method is already executing
						 * or the current method and the method of the SuperClass.prototype are the same
						 * call the superCall of the SuperClass.prototype with the right context
						 * 
						 * The first case happens because of the nature of 'this', which will be refering to context
						 * So if there is a superCall in a method and a superCall in the super-method
						 * they are practically the same thus resulting in an infinte loop
						 * 
						 * The second case happens when the method of the current instance is inherited from the SuperClass
						 * In this case the method would be executed twice
						 * 
						 * Those cases are handled by stepping over the affected methods
						 * 
						 */
						if(lang.isFunction(context[methodName])) {
							result = proxy(SuperClass, function() {
								var superProto = this.prototype, result;
								// If the super-method exists call it
								if(superMethods[methodName] !== true && lang.isFunction(superProto[methodName]) && context[methodName] !== superProto[methodName]) {
									// Tell the instance that the method of the current prototype-level is executing
		                            superMethods[methodName] = true;
						            result = superProto[methodName].apply(context, args);
									// Tell the instance that the method of the current prototype-level has finished executing
						            delete superMethods[methodName];
						        }
						        else if(lang.isFunction(superProto.superCall)) {
									result = superProto.superCall(methodName, args, context);
						        }
						        return result;
							});
                        }
                        delete superIsExecuting[objectHash];
                        // Return any result that was returned by by the super-method
                        return result;
                    },
					/**
					 * Shortcut to this.superCall("constructor", arguments)
					 */
                    $super: function() {
                        return this.superCall("constructor", arguments);
                    }
                });
            }
            return this;
        }
	});
	
    /**
     * Function to create Classes in a more classical way
     * It is available as jar.lang.Class(), later
     * 
     * An example would be:
     *
     * var MyClass = jar.lang.Class("MyClass", {
     *		constructor: function() {
     *			//constructor-code goes here...
     *			this.$super(arg1, arg2) // Call the constructor of the SuperClass
     *		},
	 *		
	 *		myMethod: function(param) {
     *			//do something
     *		},
	 *		
	 *		myMethod2: function()
	 *			this.myMethod("test");
	 *		}
     * });
     * 
     * 
     * @param String name
     * @param Object proto
     * 
     * @return Class
     */	
	Class = function(name, proto) {
		var _Class, classHash, _public, privileged = {}, _private, constructor;
		
		_Class = new Constructor("return this.Class && this instanceof this.Class && this.Class.initInstance(this, arguments);");
		
		do {
			classHash = "Class #<" + name + "#" + generateGuid() + ">";
		}
		while(classHash in Classes);
        
		// Store a reference of the Class
        Classes[classHash] = {
			self: _Class,
		
			_: Obj.fromNative({
				_isAbstract: false,
				
				_singleton: undefined,
				
				_className: name,
				
				_subClasses: Obj()
			}),
			
			Instances: Obj()
		};
		
		/**
		 * Experimental create Classes with public, private and privileged methods/properties
		 * private methods/properties in a SuperClass can be accessed in a SubClass
		 * 
		 */
			
		if("$privileged" in proto || "$private" in proto || "$public" in proto) {
			
			_public = Obj.fromNative(proto.$public);
			
			_private = Obj.fromNative(proto.$private);
			
			Obj.fromNative(proto.$privileged).each(function(prop, value) {
				if(lang.isFunction(value)) {
					privileged[prop] = function() {
						return proxy(this, value, arguments);
					};
				}
			});
		
			proto = _public.extend(privileged);
			
			Classes[classHash].__ = _private;
		}
		 
        _Class.merge({
			getHash: function() {
				return classHash;
	        },
		
			// Extend the prototype with some methods defined in Obj (see module jar.lang.Object),
			// and a reference to the Class
			prototype: Obj.fromNative(proto).extend({
	            Class: _Class,
	            
	            destructor: function() {
					delete Classes[classHash].Instances[this.getHash()];
	            }
	        })
        });
        
		return _Class;
	};
	
	Class.addStatic = function(prop, value) {
		var props = {};
		
		if(lang.isObject(prop)) {
			props = prop;
		}
		else {
			props[prop] = value;
		}
		Constructor.prototype.extend(props);
	};
	
	Class.getClass = function(hashValue) {
		return Classes[hashValue] && Classes[hashValue].self;
	};
	
	Class.getInstances = function(ClassOrHash) {
		var Instances = [];
		
		if(!this.isClass(ClassOrHash)) {
			ClassOrHash = this.getClass(ClassOrHash);
		}
		
		return ClassOrHash ? ClassOrHash.getInstances() : undefined;
	};
	
	Class.isClass = function(ClassToCheck) {
		return ClassToCheck instanceof Constructor;
	};
	
	Class.isInstance = function(Instance) {
		return Instance && Instance.Class && Instance instanceof Instance.Class && this.isClass(Instance.Class);
	};
	
    return Class;
});