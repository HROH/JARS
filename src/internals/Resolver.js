JARS.internal('Resolver', function resolverSetup(InternalsManager) {
    'use strict';

    var ROOT_MODULE_NAME = '*',
        BUNDLE_SUFFIX = '.*',
        EMPTY_STRING = '',
        DOT = '.',
        VERSION_DELIMITER = '@',
        VERSION_WITH_ZERO_PATCH = '$10',
        RE_VERSION_WITHOUT_PATCH_NUMBER = /(\d+\.\d+\.)\d+.+/,
        RE_BUNDLE = /\.\*$/,
        ResolutionStrategies = InternalsManager.get('ResolutionStrategies'),
        Resolver;

    /**
     * @access public
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
         * @return {String}
         */
        getBundleName: function(moduleName) {
            return Resolver.appendVersion(Resolver.getModuleNameWithoutVersion(moduleName) + BUNDLE_SUFFIX, Resolver.getVersion(moduleName));
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
            var version = Resolver.getVersion(moduleName),
                moduleNameWithoutVersion = Resolver.getModuleNameWithoutVersion(moduleName),
                implicitDependencyWithoutVersion = moduleNameWithoutVersion.substr(0, moduleNameWithoutVersion.lastIndexOf(DOT));

            version && (version = version.replace(RE_VERSION_WITHOUT_PATCH_NUMBER, VERSION_WITH_ZERO_PATCH));

            return Resolver.appendVersion(implicitDependencyWithoutVersion, version);
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
        getModuleTail: function(moduleName) {
            return Resolver.getModuleNameWithoutVersion(moduleName).split(DOT).pop();
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
         *
         * @return {String}
         */
        getModuleNameWithoutVersion: function(moduleName) {
            return moduleName.split(VERSION_DELIMITER)[0];
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
        getVersion: function(moduleName) {
            return moduleName.split(VERSION_DELIMITER)[1] || EMPTY_STRING;
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
            return moduleName.replace(RE_BUNDLE, EMPTY_STRING);
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
         * @param {JARS~ModuleDependencies~Declaration} modules
         * @param {String} baseModuleName
         *
         * @return {String[]}
         */
        resolve: function(modules, baseModuleName) {
            return ResolutionStrategies.any(Resolver.isRootName(baseModuleName) ? EMPTY_STRING : baseModuleName, modules, ResolutionStrategies.deps);
        },
        /**
         * @access public
         *
         * @memberof JARS~Resolver
         *
         * @param {JARS~ModuleBundle~Declaration} modules
         * @param {String} baseModuleName
         *
         * @return {String[]}
         */
        resolveBundle: function(modules, baseModuleName) {
            return ResolutionStrategies.any(baseModuleName, modules, ResolutionStrategies.bundle);
        }
    };

    return Resolver;
});
