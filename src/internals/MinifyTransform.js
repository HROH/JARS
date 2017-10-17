JARS.internal('MinifyTransform', function minifyTransformSetup() {
    'use strict';

    var MinifyTransform;

    /**
     * @memberof JARS.internals
     */
    MinifyTransform = {
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

    return MinifyTransform;
});
