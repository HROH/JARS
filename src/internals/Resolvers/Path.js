JARS.internal('Resolvers/Path', function(getInternal) {
    'use strict';

    var ExtensionTransform = getInternal('Configs/Transforms/Extension'),
        Options = getInternal('Configs/Options'),
        reduce = getInternal('Helpers/Array').reduce,
        PATH_OPTIONS = [Options.BASE_PATH, Options.VERSION_PATH, Options.DIR_PATH, Options.FILE_NAME, Options.MINIFY, Options.EXTENSION, Options.CACHE];

    /**
     * @memberof JARS~internals.Resolvers
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {string} [extension]
     *
     * @return {string}
     */
    function Path(subject, extension) {
        return reduce(PATH_OPTIONS, function(path, option) {
            return path + (option === Options.EXTENSION && extension ? ExtensionTransform(extension) : subject.config.get(option));
        }, '');
    }

    return Path;
});
