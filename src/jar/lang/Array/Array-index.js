JAR.register({
    MID: 'jar.lang.Array.Array-index',
    deps: ['..', '..Object!derive', '.Array-find']
}, function(lang, Obj, arrayFind) {
    'use strict';

    var ArrayCopy = lang.extendNativeType('Array', {
        contains: function(searchElement, fromIndex) {
            return ArrayCopy.indexOf(this, searchElement, fromIndex) !== -1;
        },

        indexOf: createIndexOf(),

        lastIndexOf: createIndexOf(true)
    });

    function createIndexOf(last) {
        var methodName = last ? 'lastIndexOf' : 'indexOf',
            findIndexMethod = arrayFind['find' + (last ? 'Last' : '') + 'Index'];

        return function(searchElement, fromIndex) {
            lang.throwErrorIfNotSet('Array', this, methodName);

            return findIndexMethod(this, equalsSearchElement, searchElement, fromIndex);
        };
    }

    function equalsSearchElement(value) {
        return value === this.valueOf(); // use valueOf() to compare numbers correctly
    }

    return Obj.extract(ArrayCopy, ['contains', 'indexOf', 'lastIndexOf']);
});