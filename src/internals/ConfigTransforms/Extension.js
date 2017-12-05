JARS.internal('ConfigTransforms/Extension', function extensionTransformSetup() {
    'use strict';

    var DOT = '.';

    /**
     * @memberof JARS.internals.ConfigTransforms
     *
     * @param {string} extension
     *
     * @return {string}
     */
    function Extension(extension) {
        return DOT + extension;
    }

    return Extension;
});
