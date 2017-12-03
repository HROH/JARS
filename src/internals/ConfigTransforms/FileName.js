JARS.internal('ConfigTransforms/FileName', function fileNameTransformSetup() {
    'use strict';

    /**
     * @memberof JARS.internals
     */
    var FileName = {
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

    return FileName;
});
