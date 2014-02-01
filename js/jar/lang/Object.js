JAR.register({
    MID: 'jar.lang.Object',
    deps: ['System', '.Array'],
    bundle: ['Object-derive', 'Object-info', 'Object-iterate', 'Object-reduce']
}, function(System, Arr) {
    'use strict';

    var lang = this,
        mergeLevel = 0,
        mergedObjects = Arr(),
        hasOwn, ObjectCopy;

    /**
     * Extend jar.lang.Object with some useful methods
     */
    ObjectCopy = lang.extendNativeType('Object', {
        /**
         * @param {Boolean} deep
         * 
         * @return {Object}
         */
        copy: function(deep) {

            return (new ObjectCopy()).extend(this, deep);
        },
        
        extend: function() {
            var args = Arr.from(arguments),
                argsLen = args.length;

            isDeepOrKeepDefault(args[argsLen - 1]) || (args[argsLen++] = false);

            args[argsLen] = true;

            return lang.callNativeTypeMethod(ObjectCopy, 'merge', this, args);
        },

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

        hasOwnProperty: true
    }, {
        from: fromObject,

        fromNative: fromObject
    });
    
    hasOwn = ObjectCopy.hasOwnProperty;

    function fromObject(object, deep) {
        return (System.isA(object, ObjectCopy) || !System.isObject(object)) ? object : ObjectCopy.copy(object, deep);
    }

    function isDeepOrKeepDefault(value) {
        return System.isBoolean(value) || !System.isSet(value);
    }

    function mergeValue(obj, mergeObj, prop, deep, keepDefault) {
        var isOwn, oldValue, newValue, valueToMerge, isOldValueObject;

        if (hasOwn(mergeObj, [prop])) {
            valueToMerge = mergeObj[prop];
            isOwn = hasOwn(obj, [prop]);
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
        return getAlreadyMergedValue(valueToMerge) || ObjectCopy.merge(oldValue, valueToMerge, true, keepDefault);
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

    return ObjectCopy;
});