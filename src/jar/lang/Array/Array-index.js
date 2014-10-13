JAR.register({
    MID: 'jar.lang.Array.Array-index',
    deps: ['..', '..assert', '..Object!derive', '.Array-find']
}, function(lang, assert, Obj, arrayFind) {
    'use strict';

    var ArrayCopy = lang.extendNativeType('Array', {
        contains: function(searchElement, fromIndex) {
            return ArrayCopy.indexOf(this, searchElement, fromIndex) !== -1;
        },

        indexOf: createIndexOf(),

        lastIndexOf: createIndexOf(true)
    });

    function createIndexOf(last) {
        var assertionMessage = 'Array.prototype.' + (last ? 'lastIndexOf' : 'indexOf') + ' called on null or undefined',
            findIndexMethod = arrayFind['find' + (last ? 'Last' : '') + 'Index'];

        return function(searchElement, fromIndex) {
            assert.isSet(this, assertionMessage);

            return findIndexMethod(this, equalsSearchElement, searchElement, fromIndex);
        };
    }

    function equalsSearchElement(value) {
        /*jslint validthis: true */
        return value === this.valueOf(); // use valueOf() to compare numbers correctly
    }

    return Obj.extract(ArrayCopy, ['contains', 'indexOf', 'lastIndexOf']);
});