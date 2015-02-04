JAR.module('jar.lang.Object', [
    'Object-derive',
    'Object-info',
    'Object-iterate',
    'Object-manipulate',
    'Object-reduce'
]).$import({
    System: [
        '::isA',
        '::isBoolean',
        '::isObject',
        '::isSet'
    ],
    '.Array': [
        '::from',
        '!find,iterate'
    ]
}).$export(function(isA, isBoolean, isObject, isSet, fromArgs, Arr) {
    'use strict';

    var lang = this,
        mergeLevel = 0,
        mergedObjects = Arr(),
        Obj = lang.sandboxNativeType('Object'),
        hasOwn;

    /**
     * Extend jar.lang.Object with some useful methods
     */
    Obj.enhance({
        /**
         * @param {Boolean} deep
         * 
         * @return {Object}
         */
        copy: function(deep) {
            return (new Obj()).extend(this, deep);
        },

        extend: function() {
            var args = fromArgs(arguments),
                argsLen = args.length;

            isDeepOrKeepDefault(args[argsLen - 1]) || (args[argsLen++] = false);

            args[argsLen] = true;
            args.unshift(this);

            return Obj.merge.apply(Obj, args);
        },

        merge: function() {
            var args = fromArgs(arguments),
                object = this,
                deep, keepDefault;

            while (!isSet(keepDefault) && isDeepOrKeepDefault(args[args.length - 1])) {
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

    hasOwn = Obj.hasOwn;

    function fromObject(object, deep) {
        return (isA(object, Obj) || !isObject(object)) ? object : Obj.copy(object, deep);
    }

    function isDeepOrKeepDefault(value) {
        return isBoolean(value) || !isSet(value);
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

            isOldValueObject = isObject(oldValue);

            if (deep && (isOldValueObject || !keepDefault) && isObject(valueToMerge)) {
                newValue = mergeDeepValue(isOldValueObject ? oldValue : {}, valueToMerge, keepDefault);
            }
            else {
                newValue = keepDefault ? oldValue : valueToMerge;
            }

            obj[prop] = newValue;
        }
    }

    function mergeDeepValue(oldValue, valueToMerge, keepDefault) {
        return getAlreadyMergedValue(valueToMerge) || Obj.merge(oldValue, valueToMerge, true, keepDefault);
    }

    function getAlreadyMergedValue(valueToMerge) {
        var alreadyMergedData = mergedObjects.find(equalsMergedValue, valueToMerge);

        return alreadyMergedData ? alreadyMergedData[1] : undefined;
    }

    function equalsMergedValue(mergedObjectData) {
        /*jslint validthis: true */
        return mergedObjectData[0] === this;
    }

    return Obj;
});