JARS.internal('Refs/Interception', function() {
    'use strict';

    function InterceptionRef(ref, refs, provide) {
        this._ref = ref;
        this._refs = refs;
        this._provide = provide;
    }

    InterceptionRef.prototype = {
        constructor: InterceptionRef,

        get: function(context) {
            return this._provide.apply(this._ref.get(context), this._refs.get(context).slice(1));
        }
    };

    return InterceptionRef;
});
