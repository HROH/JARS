JARS.internal('Refs/Modules', function(getInternal) {
    'use strict';

    var arrayEach = getInternal('Utils').arrayEach;

    /**
     * @class
     *
     * @memberof JARS~internals.Refs
     */
    function Modules() {
        this._refs = [];
    }

    Modules.prototype = {
        constructor: Modules,
        /**
         * @param {number} index
         * @param {(JARS~internals.Refs.Module|JARS~internals.Refs.Interception)} ref
         */
        add: function(index, ref) {
            this._refs[index] = ref;
        },
        /**
         * @param {string} [context]
         *
         * @return {Array<*>}
         */
        get: function(context) {
            var refs = [];

            arrayEach(this._refs, function(ref) {
                refs.push(ref.get(context));
            });

            return refs;
        }
    };

    return Modules;
});
