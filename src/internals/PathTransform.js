JARS.internal('PathTransform', function pathTransformSetup() {
    'use strict';

    var RE_END_SLASH = /\/$/,
        SLASH = '/',
        PathTransform;

    /**
     * @memberof JARS.internals
     */
    PathTransform = {
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

    return PathTransform;
});
