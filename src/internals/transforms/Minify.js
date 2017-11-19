JARS.internal('transforms/Minify', function minifyTransformSetup() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var Minify = {
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
