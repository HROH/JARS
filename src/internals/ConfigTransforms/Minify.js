JARS.internal('ConfigTransforms/Minify', function minifyTransformSetup() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    var Minify = {
        /**
         * @type {string}
         */
        type: 'boolean',
        /**
         * @param {boolean} loadMin
         *
         * @return {string}
         */
        transform: function(loadMin) {
            return loadMin ? '.min' : '';
        }
    };

    return Minify;
});
