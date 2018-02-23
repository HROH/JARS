JARS.internal('Resolvers/Path', function(getInternal) {
    'use strict';

    var ExtensionTransform = getInternal('Configs/Transforms/Extension'),
        each = getInternal('Helpers/Array').each,
        pathOptions = ['basePath', 'versionPath', 'dirPath', 'fileName', 'minify', 'extension', 'cache'],
        OPTION_EXTENSION = 'extension';

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {JARS~internals.Subjects.Module} module
     * @param {string} [extension]
     *
     * @return {string}
     */
    function Path(module, extension) {
        var path = '';

        each(pathOptions, function(option) {
            path += (option === OPTION_EXTENSION && extension) ? ExtensionTransform(extension) : module.config.get(option);
        });

        return path;
    }

    return Path;
});
