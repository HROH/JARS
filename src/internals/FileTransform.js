JARS.internal('FileTransform', function fileTransformSetup() {
    'use strict';

    var FileTransform;

    /**
     * @memberof JARS.internals
     */
    FileTransform = {
        type: 'string',
        /**
         * @param {string} fileName
         *
         * @return {string}
         */
        transform: function(fileName) {
            return fileName;
        }
    };

    return FileTransform;
});
