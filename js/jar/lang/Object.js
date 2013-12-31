JAR.register({
    MID: 'jar.lang.Object',
    deps: ['..', 'System']
}, function(jar, System) {
    var lang = this,
        ObjectCopy = jar.getConfig('allowProtoOverwrite') ? Object : lang.sandbox('Object', '__SYSTEM__'),
        ObjectCopyProto = ObjectCopy.prototype,
        mergeLevel = 0,
        mergedObjects, pseudoObjectProto, methodName;

    pseudoObjectProto = {
        merge: function(mergeObj, deep, keepDefault) {
            var obj = this,
                prop;

            mergeLevel++ || (mergedObjects = []);
            mergedObjects.push([mergeObj, obj]);

            for (prop in mergeObj) {
                mergeValue(obj, mergeObj, prop, deep, keepDefault);
            }

            --mergeLevel || (mergedObjects = null);

            return this;
        },

        each: function(callback, objectScope) {
            var obj = this,
                prop;

            for (prop in obj) {
                if (callHasOwn(obj, [prop])) {
                    callback.call(objectScope, obj[prop], prop, obj);
                }
            }
        },

        size: function() {
            return callReduce(this, [countProperties, 0]);
        },

        map: function(callback, objectScope) {
            var obj = this,
                mapObj = new ObjectCopy(),
                prop;

            for (prop in obj) {
                if (callHasOwn(obj, [prop])) {
                    mapObj[prop] = callback.call(objectScope, obj[prop], prop, obj);
                }
            }

            return mapObj;
        },

        extend: function(extObj, deep) {
            return callMerge(this, [extObj, deep, true]);
        },

        copy: function(deep) {
            var copy = new ObjectCopy();

            copy.extend(this, deep);

            return copy;
        },

        hasOwn: ObjectCopyProto.hasOwnProperty,

        reduce: function(callback, initialValue) {
            var object = this,
                isValueSet = false,
                prop,
                ret;

            if (arguments.length > 1) {
                ret = initialValue;
                isValueSet = true;
            }

            for (prop in object) {
                if (callHasOwn(object, [prop])) {
                    if (isValueSet) {
                        ret = callback(ret, object[prop], prop, object);
                    }
                    else {
                        ret = object[prop];
                        isValueSet = true;
                    }
                }
            }

            return ret;
        },

        transpose: function() {
            return callReduce(this, [transpose, new ObjectCopy()]);
        },

        keys: function() {
            return callReduce(this, [pushKey, []]);
        },

        values: function() {
            return callReduce(this, [pushValue, []]);
        }
    };

    ObjectCopy.from = ObjectCopy.fromNative = fromObject;

    /**
     * Extend jar.lang.Object with some useful methods
     */
    for (methodName in pseudoObjectProto) {
        ObjectCopyProto[methodName] = pseudoObjectProto[methodName];
        lang.delegate(pseudoObjectProto, ObjectCopy, methodName);
    }

    function fromObject(object, deep) {
        return (System.isA(object, ObjectCopy) || !System.isObject(object)) ? object : new ObjectCopy().extend(object, deep);
    }

    function mergeValue(obj, mergeObj, prop, deep, keepDefault) {
        var isOwn, oldValue, newValue, valueToMerge, isOldValueObject;

        if (callHasOwn(mergeObj, [prop])) {
            valueToMerge = mergeObj[prop];
            isOwn = callHasOwn(obj, [prop]);
            keepDefault = isOwn ? keepDefault : false;
            oldValue = isOwn ? obj[prop] : null;

            isOldValueObject = System.isObject(oldValue);

            if (deep && (isOldValueObject || !keepDefault) && System.isObject(valueToMerge)) {
                newValue = mergeDeepValue(isOldValueObject ? oldValue : {}, valueToMerge, keepDefault);
            }
            else {
                newValue = keepDefault ? oldValue : valueToMerge;
            }

            obj[prop] = newValue;
        }
    }

    function mergeDeepValue(oldValue, valueToMerge, keepDefault) {
        return getAlreadyMergedValue(valueToMerge) || callMerge(oldValue, [valueToMerge, true, keepDefault]);
    }

    function getAlreadyMergedValue(valueToMerge) {
        var idx = 0,
            mergedLen = mergedObjects.length,
            mergedValue, mergedObjectData;

        while (idx < mergedLen && !mergedValue) {
            mergedObjectData = mergedObjects[idx++];
            mergedValue = mergedObjectData[0] === valueToMerge && mergedObjectData[1];
        }

        return mergedValue;
    }

    function countProperties(size) {
        return ++size;
    }

    function transpose(object, value, prop) {
        object[value] = prop;

        return object;
    }

    function pushKey(array, value, prop) {
        array[array.length] = prop;

        return array;
    }

    function pushValue(array, value) {
        array[array.length] = value;

        return array;
    }

    function callReduce(object, withData) {
        return callMethodOn(object, 'reduce', withData);
    }

    function callHasOwn(object, withData) {
        return callMethodOn(object, 'hasOwn', withData);
    }
    
    function callMerge(object, withData) {
        return callMethodOn(object, 'merge', withData);
    }

    function callMethodOn(object, methodName, args) {
        var callingObject;

        if (object[methodName] === pseudoObjectProto[methodName]) {
            callingObject = object;
        }
        else {
            args.unshift(object);
            callingObject = ObjectCopy;
        }

        return callingObject[methodName].apply(callingObject, args);
    }

    return ObjectCopy;
});