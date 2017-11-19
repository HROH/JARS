JARS.internal('transforms/File', function fileTransformSetup() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var File = {
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

    return File;
});
