JARS.internal('Configs/Transforms/Minify', function() {
    'use strict';

    var MIN_SUFFIX = '.min',
        EMPTY_STRING = '';

    /**
     * @memberof JARS~internals.Configs.Transforms
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
