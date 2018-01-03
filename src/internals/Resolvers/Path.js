JARS.internal('Resolvers/Path', function pathResolverSetup(getInternal) {
    'use strict';

    var ExtensionTransform = getInternal('ConfigTransforms/Extension'),
        arrayEach = getInternal('Utils').arrayEach,
        pathOptions = ['basePath', 'dirPath', 'versionPath', 'fileName', 'minify', 'extension', 'cache'],
        PathResolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    PathResolver = {
        /**
         * @param {JARS.internals.Module} [module]
         * @param {string} [extension]
         *
         * @return {string}
         */
        getFullPath: function(module, extension) {
            var path = '';

            arrayEach(pathOptions, function(option) {
                path += (option === 'extension' && extension) ? ExtensionTransform(extension) : module.config.get(option);
            });

            return path;
        }
    };

    return PathResolver;
});
