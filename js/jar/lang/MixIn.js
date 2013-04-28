JAR.register({
    MID: "jar.lang.MixIn",
    deps: [".Class", ".Array", ".Function"]
}, function(Class, Arr, Fn) {
    var lang = this, MixIn;
    
    MixIn = Class("MixIn", {
		$private: {
			_name: "",
			
			_toMix: null,
			
			_allowedClasses: null,
			
			_isReceiverAllowed: function(receiver, allowedClass) {
				var isReceiverAllowed = true;
				if(Class.isClass(allowedClass)) {
					if(Class.isClass(receiver)) {
						isReceiverAllowed = receiver === allowedClass || this._isReceiverAllowed(receiver.getSuperClass(), allowedClass);
					}
					else {
						isReceiverAllowed = receiver instanceof allowedClass;
					}
				}

				return isReceiverAllowed;
			}
		},
		
		$privileged: {
			constructor: function(mixInName, toMix, allowedClasses) {
				this._name = mixInName;
		        this._toMix = toMix;
		        this._allowedClasses = allowedClasses;
		    },
			
			mixInto: function(receiver) {
				var name = this._name, receiverAllowed = false, toMix = this._toMix, allowedClasses = this._allowedClasses;
				
				if(Class.isClass(receiver) || Class.isInstance(receiver)) {
					if(!allowedClasses) {
						receiverAllowed = true;
					}
					else if(lang.isArray(allowedClasses)) {
						var iRA = Fn(this._isReceiverAllowed).remap(this);
						Arr.fromNative(allowedClasses).each(function(allowedClass) {
							receiverAllowed = iRA(receiver, allowedClass);
						});
					}
					else {
						receiverAllowed = this._isReceiverAllowed(receiver, allowedClasses);
					}
					if(receiverAllowed) {
						Class.isClass(receiver) ? receiver.prototype.extend(toMix) : receiver.extend(toMix);
					}
					else {
						lang.debug("MixIn \"#<" + name + ">\": The given receiver " + receiver.getHash() + " is not part of the allowed Classes!", "warn");
					}
				}
				else {
					lang.debug("MixIn \"#<" + name + ">\": There is no receiver given!", "warn");
				}
				
				return receiver;
			},
			
			getName: function() {
				return this._name;
			}
		}
    });
    
	/**
	 * Define a mixin-method that mixes the MixIn into the Class
	 * It is available for every Class created with jar.lang.Class()
	 * as soon as this module is loaded
	 */
    Class.addStatic("mixin", function(mixIn) {
		if(mixIn instanceof MixIn) {
			mixIn.mixInto(this);
        }
        return this;
    });
    
    return MixIn;
});