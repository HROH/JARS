JARS.internal('ConfigTransforms/Extension', function() {
    'use strict';

    var DOT = '.';

    /**
     * @memberof JARS~internals.Config.Transforms
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
