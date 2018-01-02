JARS.internal('Refs/Modules', function(getInternal) {
    'use strict';

    var arrayEach = getInternal('Utils').arrayEach;

    function ModulesRef() {
        this._refs = [];
    }

    ModulesRef.prototype = {
        constructor: ModulesRef,

        add: function(index, ref) {
            this._refs[index] = ref;
        },

        get: function(context) {
            var refs = [];

            arrayEach(this._refs, function(ref) {
                refs.push(ref.get(context));
            });

            return refs;
        }
    };

    return ModulesRef;
});
