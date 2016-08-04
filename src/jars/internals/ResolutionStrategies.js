JARS.internal('ResolutionStrategies', function(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        objectEach = utils.objectEach,
        concatString = utils.concatString,
        arrayEach = utils.arrayEach,
        resolveTypeToStrategyMap = [],
        resolutionErrorTemplates = [],
        resolutionLoggerOptions = {
            tpl: resolutionErrorTemplates
        },
        DOT = '.',
        RESOLVE_DEPS = 0,
        RESOLVE_BUNDLE = 1,
        RESOLVE_NESTED = 2,
        RE_LEADING_DOT = /^\./,
        DEFAULT_RESOLUTION_ERROR_MESSAGE = 'Could not resolve "${0}" relative to "${1}":',
        MUST_NOT_START_WITH_DOT = 'a bundle modulename must not start with a "."',
        ResolutionStrategies, Resolver;

    resolutionErrorTemplates[RESOLVE_DEPS] = concatString(DEFAULT_RESOLUTION_ERROR_MESSAGE, 'a dependency modulename must be absolute or relative to the current module.');
    resolveTypeToStrategyMap[RESOLVE_DEPS] = 'deps';
    resolutionErrorTemplates[RESOLVE_BUNDLE] = concatString(DEFAULT_RESOLUTION_ERROR_MESSAGE, MUST_NOT_START_WITH_DOT, '.');
    resolveTypeToStrategyMap[RESOLVE_BUNDLE] = 'bundle';
    resolutionErrorTemplates[RESOLVE_NESTED] = concatString(DEFAULT_RESOLUTION_ERROR_MESSAGE, MUST_NOT_START_WITH_DOT, 'or only contain it as a special symbol.');
    resolveTypeToStrategyMap[RESOLVE_NESTED] = 'nested';

    /**
     * @access private
     *
     * @memberof JARS~Resolver
     * @inner
     */
    ResolutionStrategies = {
        RESOLVE_DEPS: RESOLVE_DEPS,

        RESOLVE_BUNDLE: RESOLVE_BUNDLE,
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
        array: function(modulesOrNested, baseModuleName, resolveType) {
            var resolvedModules = [];

            arrayEach(modulesOrNested, function concatResolvedModules(moduleOrNested) {
                resolvedModules = resolvedModules.concat(getResolver().resolve(moduleOrNested, baseModuleName, resolveType));
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
        object: function(modulesOrNested, baseModuleName, resolveType) {
            var resolvedModules = [];

            objectEach(modulesOrNested, function concatResolvedModules(moduleOrNested, moduleNameKey) {
                var tmpBaseModuleName = ResolutionStrategies.string(moduleNameKey, baseModuleName, resolveType)[0];

                if(tmpBaseModuleName) {
                    resolvedModules = resolvedModules.concat(getResolver().resolve(moduleOrNested, tmpBaseModuleName, RESOLVE_NESTED));
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
        string: function(moduleName, baseModuleName, resolveType) {
            var isRelative = isRelativeModuleName(moduleName),
                isInvalidModuleName = false,
                resolvedModules, absoluteModuleName, Logger;

            if (getResolver().isRootName(baseModuleName)) {
                if(isRelative || resolveType !== RESOLVE_DEPS) {
                    isInvalidModuleName = true;
                }
                else {
                    absoluteModuleName = moduleName;
                }
            }
            else {
                absoluteModuleName = ResolutionStrategies[resolveTypeToStrategyMap[resolveType]](moduleName, baseModuleName);

                isInvalidModuleName = !absoluteModuleName;
            }

            if (isInvalidModuleName) {
                Logger = InternalsManager.get('Loader').getLogger();
                Logger.errorWithContext('Resolution', resolveType, [moduleName, baseModuleName], resolutionLoggerOptions);

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
        undefined: function() {
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
        deps: function(moduleName, baseModuleName) {
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
        nested: function(moduleName, baseModuleName) {
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
        bundle: function(moduleName, baseModuleName) {
            return isRelativeModuleName(moduleName) ? '' : makeAbsoluteModuleName(baseModuleName, moduleName);
        }
    };

    /**
     * @access private
     *
     * @memberof JARS~ResolutionStrategies
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
     * @memberof JARS~ResolutionStrategies
     * @inner
     *
     * @param {String} moduleName
     *
     * @return {Boolean}
     */
    function isRelativeModuleName(moduleName) {
        return RE_LEADING_DOT.test(moduleName);
    }

    /**
     * @access private
     *
     * @memberof JARS~ResolutionStrategies
     * @inner
     *
     * @return {JARS~Resolver}
     */
    function getResolver() {
        return Resolver || (Resolver = InternalsManager.get('Resolver'));
    }

    return ResolutionStrategies;
});
