JAR.register({
    MID: 'jar.lang.Array.Array-index',
    deps: ['..assert::isSet', '..Object!derive', '.!find']
}, function(assertIsSet, Obj, Arr) {
    'use strict';

    Arr.enhance({
        contains: function(searchElement, fromIndex) {
            return Arr.indexOf(this, searchElement, fromIndex) !== -1;
        },

        indexOf: createIndexOf(),

        lastIndexOf: createIndexOf(true)
    });

    function createIndexOf(last) {
        var assertionMessage = 'Array.prototype.' + (last ? 'lastIndexOf' : 'indexOf') + ' called on null or undefined',
            findIndexMethod = Arr['find' + (last ? 'Last' : '') + 'Index'];

        return function(searchElement, fromIndex) {
            assertIsSet(this, assertionMessage);

            return findIndexMethod(this, equalsSearchElement, searchElement, fromIndex);
        };
    }

    function equalsSearchElement(value) {
        /*jslint validthis: true */
        return value === this.valueOf(); // use valueOf() to compare numbers correctly
    }

    return Obj.extract(Arr, ['contains', 'indexOf', 'lastIndexOf']);
});