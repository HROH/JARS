JAR.register({
	MID: "jar.lang.Interface",
	deps: [".Class", ".Object", ".Array", ".Function"]
}, function(Class, Obj, Arr, Fn) {
	var lang = this, Interface;
	
	Interface = Class("Interface", {
		$private: {
			_name: "",
			
			_methods: undefined
		},
		
		$privileged: {
			constructor: function Interface(iFaceName, methods) {
				this._name = iFaceName;
				this._methods = Obj.fromNative(methods);
			},
			
			extendz: function(Iface) {
				if(Iface instanceof Interface) {
					this._methods.extend(Iface.getMethods());
				}
				return this;
			},
			
			getName: function() {
				return this._name;
			},
			
			getMethods: function() {
				return this._methods;
			}			
		},
		
		$public: {
			isImplementedBy: function(InstanceOrClass) {
				var methods = this.getMethods(), notImplemented = [],
					checkPoint = Class.isClass(InstanceOrClass) ? InstanceOrClass.prototype : Class.isInstance(InstanceOrClass) ? InstanceOrClass : null;

				if(checkPoint) {
			        methods.each(function(methodName, args) {
						if(!(lang.isFunction(checkPoint[methodName]) && (!args || args === checkPoint[methodName].length))) {
							notImplemented.push(methodName + " (arguments: " + args + ")");
						}
			        });
	        
			        if(notImplemented.length > 0) {
			            lang.debug("The " + InstanceOrClass.getHash() + "\" must implement the methods: [\"" + notImplemented.join(", ") + "\"] from Interface \"" + this.getName() + "\"!", "error");
			            checkPoint.each(function(prop) {
							checkPoint[prop] = undefined;
						});
			        }
				}
				else {
					lang.debug("No Instance or Class given to check by Interface \"" + this.getName() + "\"!", "warn");
				}
			        
		        return notImplemented.length === 0 ? InstanceOrClass : false;
			}
		}
	});
	
	/**
	 * Checks whether any method of InterFace.methods is defined in the Class
	 * Returns the Class if all methods exist false otherwise
	 * 
	 * @param Object InterFace(s)
	 * 
	 * @return Object
	 */
	Class.addStatic("implementz", function(Ifaces) {
        var isImplemented = true, currentClass = this;
        
        if(!Ifaces) {
			lang.debug("There is no interface given to compare the \"" + this.getHash() + "\" with!", "warn");
        }
        else {
			Arr.fromNative(lang.isArray(Ifaces) ? Ifaces : [Ifaces]).each(function(Iface) {
				if(Iface instanceof Interface) {
					isImplemented = Iface.isImplementedBy(currentClass);
				}
			});
		}

        return isImplemented;
    });
	
	return Interface;
});