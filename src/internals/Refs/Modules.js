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
         * @param {JARS~internals.Refs.Subject} ref
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
        },
        /**
         * @param {string} context
         */
        flush: function(context) {
            each(this._refs, function(ref) {
                ref.flush(context);
            });
        }
    };

    return Modules;
});
