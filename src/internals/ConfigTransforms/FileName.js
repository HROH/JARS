JARS.internal('ConfigTransforms/FileName', function fileNameTransformSetup() {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS.internals.ConfigTransforms
     */
    var FileName = {
        /**
         * @type {string}
         */
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
