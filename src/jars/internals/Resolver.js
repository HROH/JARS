JARS.internal('Resolver', function resolverSetup(InternalsManager) {
    'use strict';

    var ROOT_MODULE_NAME = '*',
        BUNDLE_SUFFIX = '.*',
        RESOLVE_DEPS = 0,
        RESOLVE_BUNDLE = 1,
        RESOLVE_NESTED = 2,
        DEFAULT_RESOLVER_ERROR_MESSAGE = 'Could not resolve "${0}" relative to "${1}":',
        MUST_NOT_START_WITH_DOT = 'a bundle modulename must not start with a "."',
        DOT = '.',
        SLASH = '/',
        VERSION_DELIMITER = '@',
        RE_VERSION_WITHOUT_PATCH = /(\d+\.\d+\.)\d+.+/,
        RE_END_SLASH = /\/$/,
        RE_BUNDLE = /\.\*$/,
        RE_LEADING_DOT = /^\./,
        System = InternalsManager.get('System'),
        utils = InternalsManager.get('utils'),
        concatString = utils.concatString,
        objectEach = utils.objectEach,
        arrayEach = utils.arrayEach,
        resolveTypeToStrategyMap = [],
        resolverErrorTemplates = [],
        resolverLoggerOptions = {
            tpl: resolverErrorTemplates
        },
        Resolver, ResolutionStrategies;

    resolverErrorTemplates[RESOLVE_DEPS] = concatString(DEFAULT_RESOLVER_ERROR_MESSAGE, 'a dependency modulename must be absolute or relative to the current module.');
    resolveTypeToStrategyMap[RESOLVE_DEPS] = 'deps';
    resolverErrorTemplates[RESOLVE_BUNDLE] = concatString(DEFAULT_RESOLVER_ERROR_MESSAGE, MUST_NOT_START_WITH_DOT, '.');
    resolveTypeToStrategyMap[RESOLVE_BUNDLE] = 'bundle';
    resolverErrorTemplates[RESOLVE_NESTED] = concatString(DEFAULT_RESOLVER_ERROR_MESSAGE, MUST_NOT_START_WITH_DOT, 'or only contain it as a special symbol.');
    resolveTypeToStrategyMap[RESOLVE_NESTED] = 'nested';

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
            var resolutionStrategy = ResolutionStrategies[System.getType(modules) + 'Resolution'];

            return resolutionStrategy(modules, referenceModuleName || ROOT_MODULE_NAME, resolveType || RESOLVE_DEPS);
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
            return Resolver.resolve(modules, referenceModuleName, RESOLVE_BUNDLE);
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~Resolver
     * @inner
     */
    ResolutionStrategies = {
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @param {Array} modulesOrNested
         * @param {String} baseModuleName
         * @param {Number} resolveType
         *
         * @return {Array<string>}
         */
        arrayResolution: function(modulesOrNested, baseModuleName, resolveType) {
            var resolvedModules = [];

            arrayEach(modulesOrNested, function concatResolvedModules(moduleOrNested) {
                resolvedModules = resolvedModules.concat(Resolver.resolve(moduleOrNested, baseModuleName, resolveType));
            });

            return resolvedModules;
        },
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @param {Object} modulesOrNested
         * @param {String} baseModuleName
         * @param {Number} resolveType
         *
         * @return {Array<string>}
         */
        objectResolution: function(modulesOrNested, baseModuleName, resolveType) {
            var resolvedModules = [];

            objectEach(modulesOrNested, function concatResolvedModules(moduleOrNested, moduleNameKey) {
                var tmpBaseModuleName = ResolutionStrategies.stringResolution(moduleNameKey, baseModuleName, resolveType)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(Resolver.resolve(moduleOrNested, tmpBaseModuleName, RESOLVE_NESTED));
                }
            });

            return resolvedModules;
        },
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @param {String} moduleName
         * @param {String} baseModuleName
         * @param {Number} resolveType
         *
         * @return {Array<string>}
         */
        stringResolution: function(moduleName, baseModuleName, resolveType) {
            var isRelative = isRelativeModuleName(moduleName),
                isInvalidModuleName = false,
                resolvedModules, absoluteModuleName, Logger;

            if (Resolver.isRootName(baseModuleName)) {
                if(isRelative || resolveType !== RESOLVE_DEPS) {
                    isInvalidModuleName = true;
                }
                else {
                    absoluteModuleName = moduleName;
                }
            }
            else {
                absoluteModuleName = ResolutionStrategies[resolveTypeToStrategyMap[resolveType] + 'Resolution'](moduleName, baseModuleName);

                isInvalidModuleName = !absoluteModuleName;
            }

            if (isInvalidModuleName) {
                Logger = InternalsManager.get('Loader').getLogger();
                Logger.errorWithContext('Resolver', resolveType, [moduleName, baseModuleName], resolverLoggerOptions);

                resolvedModules = [];
            }
            else {
                resolvedModules = [absoluteModuleName];
            }

            return resolvedModules;
        },
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @return {Array<string>}
         */
        undefinedResolution: function() {
            return [];
        },
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @param {String} moduleName
         * @param {String} baseModuleName
         *
         * @return {String}
         */
        depsResolution: function(moduleName, baseModuleName) {
            var baseParts, absoluteModuleName;

            if(isRelativeModuleName(moduleName)) {
                baseParts = baseModuleName.split(DOT);

                if(!isRelativeModuleName(baseModuleName)) {
                    while (baseParts.length && isRelativeModuleName(moduleName)) {
                        moduleName = moduleName.substr(1);
                        baseParts.pop();
                    }

                    if(!isRelativeModuleName(moduleName) && (moduleName || baseParts.length)) {
                        baseModuleName = baseParts.join(DOT);

                        absoluteModuleName = makeAbsoluteModuleName(baseModuleName, moduleName);
                    }
                }
            }
            else {
                absoluteModuleName = moduleName;
            }

            return absoluteModuleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @param {String} moduleName
         * @param {String} baseModuleName
         *
         * @return {String}
         */
        nestedResolution: function(moduleName, baseModuleName) {
            var absoluteModuleName;

            // self reference
            if(moduleName === DOT) {
                absoluteModuleName = baseModuleName;
            }
            else if (!isRelativeModuleName(moduleName)) {
                absoluteModuleName = makeAbsoluteModuleName(baseModuleName, moduleName);
            }

            return absoluteModuleName;
        },
        /**
         * @access public
         *
         * @memberof JARS~ResolutionStrategies
         *
         * @param {String} moduleName
         * @param {String} baseModuleName
         *
         * @return {String}
         */
        bundleResolution: function(moduleName, baseModuleName) {
            return isRelativeModuleName(moduleName) ? '' : makeAbsoluteModuleName(baseModuleName, moduleName);
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~Resolver
     * @inner
     *
     * @param {String} baseModuleName
     * @param {String} moduleName
     *
     * @return {Boolean}
     */
    function makeAbsoluteModuleName(baseModuleName, moduleName) {
        var separator = InternalsManager.get('InterceptionManager').removeInterceptionData(moduleName) ? DOT : '';

        return [baseModuleName, moduleName].join(separator);
    }

    /**
     * @access private
     *
     * @memberof JARS~Resolver
     * @inner
     *
     * @param {String} moduleName
     *
     * @return {Boolean}
     */
    function isRelativeModuleName(moduleName) {
        return RE_LEADING_DOT.test(moduleName);
    }

    return Resolver;
});
