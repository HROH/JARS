JAR.register({
    MID: 'jar.lang.Object',
    deps: ['System', '.Array']
}, function(System, Arr) {
    'use strict';

    var lang = this,
        mergeLevel = 0,
        mergedObjects = Arr(),
        ObjectCopy;

    /**
     * Extend jar.lang.Object with some useful methods
     */
    ObjectCopy = lang.extendNativeType('Object', {
        merge: function() {
            var args = Arr.from(arguments),
                object = this,
                deep, keepDefault;

            while (!System.isSet(keepDefault) && isDeepOrKeepDefault(args[args.length - 1])) {
                keepDefault = deep;
                deep = args.pop() || false;
            }

            args.each(function(mergeObject) {
                var prop;

                mergeLevel++;
                mergedObjects.push([mergeObject, object]);

                for (prop in mergeObject) {
                    mergeValue(object, mergeObject, prop, deep, keepDefault);
                }

                --mergeLevel || (mergedObjects = Arr());
            });

            return object;
        },

        each: function(callback, context) {
            var object = this,
                prop;

            for (prop in object) {
                if (callHasOwn(object, [prop])) {
                    callback.call(context, object[prop], prop, object);
                }
            }
        },

        size: function() {
            return callReduce(this, [countProperties, 0]);
        },

        map: function(callback, context) {
            var object = this,
                mappedObject = new ObjectCopy(),
                prop;

            for (prop in object) {
                if (callHasOwn(object, [prop])) {
                    mappedObject[prop] = callback.call(context, object[prop], prop, object);
                }
            }

            return mappedObject;
        },

        extend: function() {
            var args = Arr.from(arguments),
                argsLen = args.length;

            isDeepOrKeepDefault(args[argsLen - 1]) || (args[argsLen++] = false);

            args[argsLen] = true;

            return callMerge(this, args);
        },

        copy: function(deep) {
            return (new ObjectCopy()).extend(this, deep);
        },

        filter: function(callback, context) {
            var object = this,
                filteredObject = new ObjectCopy(),
                prop;

            for (prop in object) {
                if (callHasOwn(object, [prop]) && callback.call(context, object[prop], prop, object)) {
                    filteredObject[prop] = object[prop];
                }
            }

            return filteredObject;
        },

        hasOwn: Object.prototype.hasOwnProperty,

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
    }, {
        from: fromObject,

        fromNative: fromObject
    });

    function fromObject(object, deep) {
        return (System.isA(object, ObjectCopy) || !System.isObject(object)) ? object : ObjectCopy.copy(object, deep);
    }

    function isDeepOrKeepDefault(value) {
        return System.isBoolean(value) || !System.isSet(value);
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
        var mergedValue;

        // TODO replace with Array#find if no longer experimental
        mergedObjects.some(function(mergedObjectData) {
            mergedValue = mergedObjectData[0] === valueToMerge && mergedObjectData[1];

            return mergedValue;
        });

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
        return lang.callNativeTypeMethod(ObjectCopy, 'reduce', object, withData);
    }

    function callHasOwn(object, withData) {
        return lang.callNativeTypeMethod(ObjectCopy, 'hasOwn', object, withData);
    }

    function callMerge(object, withData) {
        return lang.callNativeTypeMethod(ObjectCopy, 'merge', object, withData);
    }

    return ObjectCopy;
});