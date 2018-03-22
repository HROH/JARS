JARS.internal('Configs/Transforms/Path', function() {
    'use strict';

    var RE_END_SLASH = /\/$/,
        SLASH = '/';

    /**
     * @memberof JARS~internals.Configs.Transforms
     *
     * @param {string} path
     *
     * @return {string}
     */
    function Path(path) {
        return !path || RE_END_SLASH.test(path) ? path : path + SLASH;
    }

    return Path;
});
