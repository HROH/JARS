JARS.internal('Refs/Interception', function() {
    'use strict';

    /**
     * @class
     *
     * @memberof JARS~internals.Refs
     *
     * @param {JARS~internals.Refs.Module} ref
     * @param {JARS~internals.Refs.Modules} refs
     * @param {function()} provide
     */
    function Interception(ref, refs, provide) {
        this._ref = ref;
        this._refs = refs;
        this._provide = provide;
    }

    Interception.prototype = {
        constructor: Interception,
        /**
         * @param {string} [context]
         *
         * @return {*}
         */
        get: function(context) {
            return this._provide.apply(this._ref.get(context), this._refs.get(context));
        }
    };

    return Interception;
});
