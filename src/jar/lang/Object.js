JAR.register({
    MID: 'jar.lang.Object',
    deps: ['System', '.Array!find|iterate'],
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
            args.unshift(this);

            return ObjectCopy.merge.apply(ObjectCopy, args);
        },

        merge: function() {
            var args = Arr.from(arguments),
                object = this,
                deep, keepDefault;

            while (!System.isSet(keepDefault) && isDeepOrKeepDefault(args[args.length - 1])) {
                keepDefault = deep;
                deep = args.pop() || false;
            }

            args.each(initMerge, {
                o: object,
                d: deep,
                k: keepDefault
            });

            return object;
        },

        hasOwn: Object.prototype.hasOwnProperty
    }, {
        from: fromObject,

        fromNative: fromObject
    });

    hasOwn = ObjectCopy.hasOwn;

    function fromObject(object, deep) {
        return (System.isA(object, ObjectCopy) || !System.isObject(object)) ? object : ObjectCopy.copy(object, deep);
    }

    function isDeepOrKeepDefault(value) {
        return System.isBoolean(value) || !System.isSet(value);
    }

    function initMerge(mergeObject) {
        /*jslint validthis: true */
        var prop;

        mergeLevel++;
        mergedObjects.push([mergeObject, this.o]);

        for (prop in mergeObject) {
            mergeValue(this.o, mergeObject, prop, this.d, this.k);
        }

        --mergeLevel || (mergedObjects = Arr());
    }

    function mergeValue(obj, mergeObj, prop, deep, keepDefault) {
        var oldValue, newValue, valueToMerge, isOldValueObject;

        if (hasOwn(mergeObj, [prop])) {
            valueToMerge = mergeObj[prop];

            if (hasOwn(obj, [prop])) {
                oldValue = obj[prop];
            }
            else {
                keepDefault = false;
                oldValue = null;
            }

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
        var alreadyMergedData = mergedObjects.find(equalsMergedValue, valueToMerge);

        return alreadyMergedData ? alreadyMergedData[1] : undefined;
    }

    function equalsMergedValue(mergedObjectData) {
        /*jslint validthis: true */
        return mergedObjectData[0] === this;
    }

    return ObjectCopy;
});