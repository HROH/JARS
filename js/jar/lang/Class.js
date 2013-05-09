JAR.register({
	MID: "jar.lang.Class",
	deps: [".Object", ".Array", ".Function"],
	bundle: ["Abstract"]
}, function(Obj, Arr, Fn) {
	var lang = this, Constructor = lang.copyNative("Function"), ClassPrivateMethods, ClassFactory, Classes = {}, proxy;
	
	/***Start Hash-generation***/
	function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    
    function generateHash() {
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
    /***End Hash-genearation***/
	
	proxy = function(InstanceOrClass, method, args) {
		var result, ClassHidden, tmpPrivateProps, inPrivileged = false;
		
		if(ClassFactory.isClass(InstanceOrClass)) {
			tmpPrivateProps = Classes[InstanceOrClass.getHash()];
		}
		else {
			ClassHidden = Classes[InstanceOrClass.Class.getHash()];
			tmpPrivateProps = ClassHidden._Instances[InstanceOrClass.getHash()]._private.extend(ClassHidden._prototype);
		}

		InstanceOrClass.extend(tmpPrivateProps);
		if(tmpPrivateProps.inPrivileged) {
			inPrivileged = true;
			delete InstanceOrClass.inPrivileged;
		}
		else {
			tmpPrivateProps.inPrivileged = true;
		}
		
		result = method.apply(InstanceOrClass, args || []);
		
		if(!inPrivileged) {
			delete tmpPrivateProps.inPrivileged;
			tmpPrivateProps.each(function(prop, value) {
				if(InstanceOrClass[prop] !== value) {
					tmpPrivateProps[prop] = InstanceOrClass[prop];
				}
				delete InstanceOrClass[prop];
			});
		}
		
		return result;
	};
	
	ClassPrivateMethods = Obj.fromNative({
		initInstance: function(Instance, args) {
			var Class = this, classHash = Class.getHash(),
				Instances = Class._Instances, directCall = false;
			
			// Class._isTransmitting is true when a SubClass is inheriting over SubClass.extendz(SuperClass)
			// In this case we don't need the constructor to be executed neither do we need a new Instance to be saved
			if(Class._isTransmitting) {
				return Instance;
			}
			// If Class is an abstract Class return an empty Object
			// Returning undefined won't work because of the function behaviour in combinatino with 'new'
	        else if(Class._isAbstract) {
	            lang.debug("Abstract " + classHash + ": You can't create a new instance of an abstract Class.", "warn");
	            return {};
	        }
	        // If a Singleton exists return it and skip the rest
	        else if(Class._singleton) {
	            lang.debug("Singleton " + classHash + ": You can't create a new instance of this Class.", "warn");
	            return Class._singleton;
	        }
			else if(ClassFactory.isInstance(Instance)) {
				// If we have a new Instance that is not stored in the Instances yet
				// create a unique hash for it and store a reference under this hash for later use
				// This hash is also used to store the private properties/methods
				//
				// Note: If an Instance isn't used anymore this reference has to be deleted over the destructor of the Instance
				// Otherwise this could lead to memory leaks if there are too many Instances
				if(Instance instanceof Class && !(lang.isFunction(Instance.getHash) && Instances[Instance.getHash()] === Instance)) {
					var objectHashPrefix, objectHash;

		            objectHashPrefix = "object #<" + Class.getClassName() + "#";
		            
					do {
						objectHash = objectHashPrefix + generateHash() + ">";
					}
					while(objectHash in Instances);
					
					// !!!IMPORTANT: never delete or overwrite this method!!!
		            Instance.getHash = function() {
						return objectHash;
		            };
		            
		            Instances[objectHash] = {Instance: Instance, _private: Obj(), _destructors: Arr()};
	            }
	            else {
					return Instance;
	            }
	        }
	        else {
				// We came here because Class.initInstance was called directly
				// [ Class.initInstance(arg1, arg2, ...) <--> new Class(arg1, arg2, ...) ]
				// So we have to create a new Instance and return it
				directCall = true;
				args = arguments;
				// prevent the constructor from being executed twice
				Class._skipConstructor = true;
				Instance = new Class();
				Class._skipConstructor = false;
	        }
            Class._skipConstructor || Instance.constructor.apply(Instance, args);
            
			return directCall ? Instance : undefined;
	    },
		
		getClassName: function() {
			return this._className;
		},
		
		isSingleton: function() {
			return !!this._singleton;
		},
		
		singleton: function() {
            var Class = this;
            Class._singleton = Class._singleton || Class.initInstance.apply(Class, arguments);
            return Class._singleton;
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
		
		getSubClasses: function() {
			var SubClasses = Arr();
			
			this._subClasses.each(function(hash, SubClass) {
				SubClasses.push(SubClass.Class);
			});
			
			return SubClasses;
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
		 *		var MySubClass = jar.lang.Class("MySubClass", {
		 *			constructor: function() {
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
		 * 
		 * @param Object SuperClass
		 * 
		 * @return Object
		 */		
		extendz: function(SuperClass) {
			var Class = this, classHash = Class.getHash();
			
			
			if(Class._superClass) {
				lang.debug(classHash + " already has the SuperClass: " + this.getSuperClass().getHash() + "!", "error");
			}
			else if(!ClassFactory.isClass(SuperClass)) {
				lang.debug("There is no SuperClass given for " + classHash + "!", "warn");
			}
			else {
				var SuperClassHidden = Classes[SuperClass.getHash()];
	                
				// add SuperClass reference
				Class._superClass = SuperClass;
				// extend own private prototype with that of the SuperClass
				Class._prototype.extend(SuperClassHidden._prototype);
				// add SubClass reference in the SuperClass
				SuperClassHidden._subClasses[classHash] = Classes[classHash];
				
				// Prevent the default constructor and objectHash-generation to be executed
                SuperClassHidden._isTransmitting = true;
                // Create a new Instance of the SuperClass and merge it with the current prototype
                // to overwrite in the correct order
                this.prototype = new SuperClass().merge(this.prototype);
                // end transmission
                SuperClassHidden._isTransmitting = false;
                
                // Check if methods in the public and the private prototype were overwritten
                // and do it properly so that this.$super() works in Instances
                Arr(this.prototype, this._prototype).each(function(protoToOverwrite) {
					protoToOverwrite.each(function(prop, value) {
						lang.isFunction(value) && Class.overwriteMethod(prop, value);
	                });
                });
            }
            return this;
        },
		
		overwriteMethod: function(methodName, method) {
	        var ClassHiddenProto = this._prototype, protoToOverwrite,
				SuperClass = this._superClass, SuperClassHiddenProto, superProtoToCheckAgainst;
	        
	        // Never overwrite Class-, getHash- and destructor-methods
	        if(SuperClass && lang.isFunction(method) && !(methodName === "Class" || methodName === "getHash" || methodName === "destructor")) {
				SuperClassHiddenProto = Classes[SuperClass.getHash()]._prototype;
				if(methodName in SuperClass.prototype) {
					protoToOverwrite = this.prototype;
					superProtoToCheckAgainst = SuperClass.prototype;
				}
				else if(methodName in SuperClassHiddenProto) {
					protoToOverwrite = ClassHiddenProto;
					superProtoToCheckAgainst = SuperClassHiddenProto;
				}
				// check if the method is overwriting a method in the SuperClass.prototype and is not already overwritten in the current Class.prototype
				if(superProtoToCheckAgainst && (!protoToOverwrite.hasOwn(methodName, method) || protoToOverwrite[methodName] === method) &&
					lang.isFunction(superProtoToCheckAgainst[methodName]) && superProtoToCheckAgainst[methodName] !== method
				) {
					protoToOverwrite[methodName] = function() {
						var result, currentSuper;
						
						// if this.$super is already set store it for later
						if(this.$super) {
							currentSuper = this.$super;
						}
						
						// create a new temporary this.$super that uses the method of the SuperClass.prototype
						this.$super = function() {
							return superProtoToCheckAgainst[methodName].apply(this, arguments);
						};
						
						result = method.apply(this, arguments);
						
						// restore or delete this.$super
						if(currentSuper) {
							this.$super = currentSuper;
						}
						else {
							delete this.$super;
						}
						
						return result;
					};
				}
			}
		},
		
		getInstances: function() {
			var Instances = [];
			
			this._Instances.each(function(hash, Instance) {
				Instances.push(Instance.Instance);
			});
			
			this._subClasses.each(function(SubClass) {
				Instances = Instances.concat(SubClass.getInstances());
			});
			
			return Arr.fromNative(Instances);
		},
		
		addDestructor: function(destructor, Instance) {
			var Class = this, destructors;
			
			if(lang.isFunction(destructor)) {
				if(Instance instanceof Class) {
					destructors = Class._Instances[Instance.getHash()]._destructors;
				}
				else {
					destructors = Class._destructors;
				}
				destructors.push(destructor);
			}
			
			return Class;
		},
		
		destruct: function(Instance) {
			var Class = this, destructors, hash, Instances = this._Instances;
			
			if(Instance instanceof Class) {
				hash = Instance.getHash();
				
				if(hash in Instances) {
					destructors = this._destructors;
					
					while(Class.hasSuperClass()) {
						Class = Class.getSuperClass();
						destructors.mergeUnique(Classes[Class.getHash()]._destructors);
					}
					
					destructors.mergeUnique(Instances[hash]._destructors);
					
					while(destructors.length > 0) {
						destructors.shift().call(Instance);
					}
					
					delete Instances[hash];
				}
				else {
					Instance.Class.destruct(Instance);
				}
				
				return this;
			}
			/*
			else {
				hash = this.getHash();
				this.getInstances().each(function(Instance) {
					Instance.Class.destruct(Instance);
				});
				
				if(this._subClasses) {
					this.getSubClasses().each(function(SubClass) {
						SubClass.destruct();
					});
				}
				if(this._superClass) {
					delete Classes[this._superClass.getHash()]._subClasses[hash];
				}
				delete Classes[hash];
				
				return undefined;
			}
			*/
		}
	});
	
	ClassPrivateMethods.each(function(methodName, method) {
		Constructor.prototype[methodName] = function() {
			return proxy(this, method, arguments);
		};
	});
	
	Constructor.prototype.extend({
		hasSuperClass: function() {
			return !!this.getSuperClass();
		},
		
		hasSubClasses: function() {
			return this.getSubClasses().length > 0;
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
	ClassFactory = function(name, proto) {
		var Class, classHash, ClassHidden;
		
		Class = new Constructor("return this.Class && this instanceof this.Class && this.Class.initInstance(this, arguments);");
		
		do {
			classHash = "Class #<" + name + "#" + generateHash() + ">";
		}
		while(classHash in Classes);
        
		// Store a reference of the Class and define some private properties
        ClassHidden = Classes[classHash] = Obj.fromNative({
			Class: Class,
			
			_isAbstract: false,
			
			_singleton: null,
			
			_className: name,
			
			_skipConstructor: false,
			
			_isTransmitting: false,
			
			_superClass: null,
			
			_subClasses: Obj(),
			
			_prototype: Obj(),
		
			_Instances: Obj(),
			
			_destructors: Arr()
		});
		
		/**
		 * Experimental create Classes with public, private and privileged methods/properties
		 * Private methods/properties in a SuperClass can be accessed in a SubClass
		 * 
		 */
			
		if("$privileged" in proto || "$private" in proto || "$public" in proto) {
			
			ClassHidden._prototype.extend(proto.$private);
		
			proto = Obj.fromNative(proto.$public).extend(Obj.fromNative(proto.$privileged).map(function(prop, value) {
				if(lang.isFunction(value)) {
					return function() {
						return proxy(this, value, arguments);
					};
				}
				return value;
			}));
		}
		 
        Class.merge({
			getHash: function() {
				return classHash;
	        },
		
			// Extend the prototype with some methods defined in Obj (see module jar.lang.Object),
			// and a reference to the Class
			prototype: Obj.fromNative(proto).extend({
	            Class: Class
	        })
        });
        
		return Class;
	};
	/**
	 * This method is used to add methods like 'implementz' or 'mixin'
	 * to all Classes, when the module is loaded
	 * Added methods are automatically available to 'all' Classes
	 *
	 * @param String|Object prop
	 * @param Function|undefined value
	 */
	ClassFactory.addStatic = function(prop, value) {
		var props = {};
		
		if(lang.isObject(prop)) {
			props = prop;
		}
		else {
			props[prop] = value;
		}
		Constructor.prototype.extend(props);
	};
	
	ClassFactory.getClass = function(hashValue) {
		return Classes[hashValue] && Classes[hashValue].Class;
	};
	
	ClassFactory.getInstances = function(ClassOrHash) {
		if(!this.isClass(ClassOrHash)) {
			ClassOrHash = this.getClass(ClassOrHash);
		}
		
		return ClassOrHash ? ClassOrHash.getInstances() : undefined;
	};
	
	ClassFactory.isClass = function(Class) {
		return Class instanceof Constructor;
	};
	
	ClassFactory.isInstance = function(Instance) {
		return Instance && Instance.Class && Instance instanceof Instance.Class && this.isClass(Instance.Class);
	};
	
    return ClassFactory;
});