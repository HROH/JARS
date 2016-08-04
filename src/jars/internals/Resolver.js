JARS.internal('Resolver', function resolverSetup(InternalsManager) {
    'use strict';

    var ROOT_MODULE_NAME = '*',
        BUNDLE_SUFFIX = '.*',
        DOT = '.',
        SLASH = '/',
        VERSION_DELIMITER = '@',
        RE_VERSION_WITHOUT_PATCH = /(\d+\.\d+\.)\d+.+/,
        RE_END_SLASH = /\/$/,
        RE_BUNDLE = /\.\*$/,
        System = InternalsManager.get('System'),
        ResolutionStrategies = InternalsManager.get('ResolutionStrategies'),
        Resolver;

    /**
     * @access private
     *
     * @namespace Resolver
     *
     * @memberof JARS
     * @inner
     */
    Resolver = {
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {Boolean}
         */
        isRootName: function(moduleName) {
            return ROOT_MODULE_NAME === moduleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @return {String}
         */
        getRootName: function() {
            return ROOT_MODULE_NAME;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {Object}
         */
        getPathOptions: function(moduleName) {
            var options = {},
                versionParts = moduleName.split(VERSION_DELIMITER),
                pathParts = versionParts[0].split(DOT),
                fileName = options.fileName = pathParts.pop(),
                firstLetterFileName = fileName.charAt(0);

            versionParts[1] && (options.versionDir = Resolver.ensureEndsWithSlash(versionParts[1]));

            if (firstLetterFileName === firstLetterFileName.toLowerCase()) {
                pathParts.push(fileName);
            }

            options.dirPath = pathParts.length ? Resolver.ensureEndsWithSlash(pathParts.join(SLASH)) : '';

            return options;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} path
         *
         * @return {String}
         */
        ensureEndsWithSlash: function(path) {
            return (!path || RE_END_SLASH.test(path)) ? path : path + SLASH;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        getBundleName: function(moduleName) {
            return moduleName + BUNDLE_SUFFIX;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        getImplicitDependencyName: function(moduleName) {
            var versionParts = moduleName.split(VERSION_DELIMITER),
                version = versionParts[1];

            moduleName = versionParts[0];
            moduleName = moduleName.substr(0, moduleName.lastIndexOf(DOT));

            versionParts[0] = moduleName;

            version && (version = version.replace(RE_VERSION_WITHOUT_PATCH, '$10'));

            return Resolver.appendVersion(moduleName, version);
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {Boolean}
         */
        isVersionedModule: function(moduleName) {
            return moduleName.indexOf(VERSION_DELIMITER) > -1;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         * @param {String} version
         *
         * @return {String}
         */
        appendVersion: function(moduleName, version) {
            return (moduleName && version) ? [moduleName, version].join(VERSION_DELIMITER) : moduleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {String}
         */
        extractModuleNameFromBundle: function(moduleName) {
            return moduleName.replace(RE_BUNDLE, '');
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {String} moduleName
         *
         * @return {Boolean}
         */
        isBundle: function(moduleName) {
            return RE_BUNDLE.test(moduleName);
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {(String|Object|Array)} modules
         * @param {String} referenceModuleName
         * @param {Number} resolveType
         *
         * @return {Array<string>}
         */
        resolve: function(modules, referenceModuleName, resolveType) {
            var resolutionStrategy = ResolutionStrategies[System.getType(modules)];

            return resolutionStrategy(modules, referenceModuleName || ROOT_MODULE_NAME, resolveType || ResolutionStrategies.RESOLVE_DEPS);
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {(String|Object|Array)} modules
         * @param {String} referenceModuleName
         *
         * @return {Array<string>}
         */
        resolveBundle: function(modules, referenceModuleName) {
            return Resolver.resolve(modules, referenceModuleName, ResolutionStrategies.RESOLVE_BUNDLE);
        }
    };

    return Resolver;
});
