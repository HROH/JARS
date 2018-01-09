JARS.internal('Resolvers/Path', function pathResolverSetup(getInternal) {
    'use strict';

    var ExtensionTransform = getInternal('Configs/Transforms/Extension'),
        each = getInternal('Helpers/Array').each,
        pathOptions = ['basePath', 'dirPath', 'versionPath', 'fileName', 'minify', 'extension', 'cache'],
        Path;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Resolvers
     */
    Path = {
        /**
         * @param {JARS~internals.Subjects.Module} module
         * @param {string} [extension]
         *
         * @return {string}
         */
        getFullPath: function(module, extension) {
            var path = '';

            each(pathOptions, function(option) {
                path += (option === 'extension' && extension) ? ExtensionTransform(extension) : module.config.get(option);
            });

            return path;
        }
    };

    return Path;
});
