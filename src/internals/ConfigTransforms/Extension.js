JARS.internal('ConfigTransforms/Extension', function extensionTransformSetup() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    var Extension = {
        /**
         * @type {string}
         */
        type: 'string',
        /**
         * @param {string} extension
         *
         * @return {string}
         */
        transform: function(extension) {
            return '.' + extension;
        }
    };

    return Extension;
});
