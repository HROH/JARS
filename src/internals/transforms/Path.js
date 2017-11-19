JARS.internal('transforms/Path', function pathTransformSetup() {
    'use strict';

    var RE_END_SLASH = /\/$/,
        SLASH = '/',
        Path;

    /**
     * @memberof JARS.internals
     */
    Path = {
        type: 'string',
        /**
         * @param {string} path
         *
         * @return {string}
         */
        transform: function(path) {
           return (!path || RE_END_SLASH.test(path)) ? path : path + SLASH;
        }
    };

    return Path;
});
