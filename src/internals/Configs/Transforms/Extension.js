JARS.internal('Configs/Transforms/Extension', function() {
    'use strict';

    var RE_LEADING_DOT = /^\./,
        DOT = '.';

    /**
     * @memberof JARS~internals.Configs.Transforms
     *
     * @param {string} extension
     *
     * @return {string}
     */
    function Extension(extension) {
        return RE_LEADING_DOT.test(extension) ? extension : DOT + extension;
    }

    return Extension;
});
