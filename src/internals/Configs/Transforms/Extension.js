JARS.internal('Configs/Transforms/Extension', function() {
    'use strict';

    var DOT = '.';

    /**
     * @memberof JARS~internals.Configs.Transforms
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
