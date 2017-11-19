JARS.internal('transforms/Extension', function extensionTransformSetup() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var Extension = {
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
