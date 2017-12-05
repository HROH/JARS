JARS.internal('ConfigTransforms/FileName', function fileNameTransformSetup() {
    'use strict';

    /**
     * @memberof JARS.internals.ConfigTransforms
     *
     * @param {string} fileName
     *
     * @return {string}
     */
    function FileName(fileName) {
        return fileName;
    }

    return FileName;
});
