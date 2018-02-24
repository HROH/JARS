JARS.internal('Refs/Modules', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each;

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

            each(this._refs, function(ref) {
                refs.push(ref.get(context));
            });

            return refs;
        }
    };

    return Modules;
});
