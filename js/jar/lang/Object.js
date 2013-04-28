JAR.register({
	MID: "jar.lang.Object"
}, function() {
	var lang = this,
		pseudoObjectProto, ObjectCopy = lang.copyNative("Object"),
		ObjectCopyProto = ObjectCopy.prototype;

	pseudoObjectProto = {
		merge: function(mergeObj, deep, keepDefault, mergedObjects) {
			var t = this;
			if (!(mergeObj && lang.isObject(mergeObj))) {
				return this;
			}
			mergedObjects = mergedObjects || [];
			mergedObjects.push([mergeObj, this]);
			ObjectCopyProto.each.call(mergeObj, function(prop, value) {
				if (lang.isObject(value) && deep) {
					var merged = false,
						i = 0,
						l = mergedObjects.length,
						mergedObj;

					while (i < l && !merged) {
						mergedObj = mergedObjects[i];
						merged = mergedObj[0] === value && mergedObj[1];
						i++;
					}

					if (!merged) {
						merged = ObjectCopyProto.merge.call(lang.isObject(t[prop]) ? t[prop] : {}, value, deep, keepDefault, mergedObjects);
						mergedObjects.push([value, merged]);
					}
					t[prop] = merged;
				}
				else {
					if (!(keepDefault && ObjectCopyProto.hasOwn.call(t, prop, value))) {
						t[prop] = value;
					}
				}
			});
			return this;
		},

		each: function(callback) {
			for (var prop in this) {
				if (ObjectCopyProto.hasOwn.call(this, prop, this[prop])) {
					callback(prop, this[prop]);
				}
			}
		},

		map: function(callback) {
			var mapObj = new ObjectCopy();
			ObjectCopyProto.each.call(this, function(prop, value) {
				mapObj[prop] = callback(prop, value);
			});
			return mapObj;
		},

		extend: function(extObj, deep) {
			return ObjectCopyProto.merge.call(this, extObj, deep, true);
		},

		copy: function(deep) {
			var copy = new ObjectCopy();
			ObjectCopyProto.each.call(this, function(prop, value) {
				if (deep && lang.isObject(value)) {
					value = ObjectCopyProto.copy.call(value, deep);
				}
				copy[prop] = value;
			});
			return copy;
		},

		hasOwn: function(prop, value) {
			return (ObjectCopyProto.hasOwnProperty.call(this, prop)) && (!(prop in pseudoObjectProto) || value !== pseudoObjectProto[prop]);
		}
	};

	ObjectCopy.fromNative = function(nativeObj) {
		nativeObj = nativeObj || {};
		var prop, newObj;

		if (nativeObj instanceof ObjectCopy) {
			newObj = nativeObj;
		}
		else if (lang.isObject(nativeObj)) {
			newObj = new ObjectCopy().merge(nativeObj);
		}
		return newObj;
	};
        
    /**
     * Extend jar.lang.Object with some useful methods
     */
	for (var prop in pseudoObjectProto) {
		ObjectCopyProto[prop] = pseudoObjectProto[prop];
	}

	return ObjectCopy;
});