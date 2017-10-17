JARS.internal('ExtensionTransform', function extensionTransformSetup() {
    'use strict';

    var ExtensionTransform;

    /**
     * @memberof JARS.internals
     */
    ExtensionTransform = {
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

    return ExtensionTransform;
});
