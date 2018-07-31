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
         * @param {string} [scope]
         *
         * @return {Array<*>}
         */
        get: function(scope) {
            var refs = [];

            each(this._refs, function(ref) {
                refs.push(ref.get(scope));
            });

            return refs;
        },
        /**
         * @param {string} scope
         */
        flush: function(scope) {
            each(this._refs, function(ref) {
                ref.flush(scope);
            });
        }
    };

    return Modules;
});
