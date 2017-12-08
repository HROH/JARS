JARS.internal('TypeLookup', function() {
    'use strict';

    var typeLookup = {},
        toString = ({}).toString,
        TYPE_LOOKUP_PREFIX = '[object ',
        TYPE_LOOKUP_SUFFIX = ']',
        TypeLookup;

    TypeLookup = {
        add: function(typeDef) {
            return (typeLookup[TYPE_LOOKUP_PREFIX + typeDef + TYPE_LOOKUP_SUFFIX] = typeDef.toLowerCase());
        },

        get: function(value) {
            return typeLookup[toString.call(value)];
        }
    };

    return TypeLookup;
});
