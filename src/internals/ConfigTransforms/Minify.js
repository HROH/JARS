JARS.internal('ConfigTransforms/Minify', function minifyTransformSetup() {
    'use strict';

    var MIN_SUFFIX = '.min',
        EMPTY_STRING = '';

    /**
     * @memberof JARS.internals.ConfigTransforms
     *
     * @param {boolean} loadMin
     *
     * @return {string}
     */
    function Minify(loadMin) {
        return loadMin ? MIN_SUFFIX : EMPTY_STRING;
    }

    return Minify;
});
