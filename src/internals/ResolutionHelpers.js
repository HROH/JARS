JARS.internal('ResolutionHelpers', function(InternalsManager) {
    'use strict';

    var VersionResolver = InternalsManager.get('VersionResolver'),
        EMPTY_STRING = '',
        DOT = '.',
        RE_LEADING_DOT = /^\./,
        ResolutionHelpers;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    ResolutionHelpers = {
        /**
         * @param {JARS.internals.Module} baseModule
         * @param {string} moduleName
         *
         * @return {string}
         */
        makeAbsolute: function(baseModule, moduleName) {
            var separator = InternalsManager.get('InterceptionManager').removeInterceptionData(moduleName) ? DOT : EMPTY_STRING;

            return (baseModule.isRoot || ResolutionHelpers.isRelative(moduleName)) ? EMPTY_STRING : VersionResolver.unwrapVersion(function(baseModuleName) {
                return [baseModuleName, moduleName].join(separator);
            })(baseModule.name);
        },
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isRelative: function(moduleName) {
            return RE_LEADING_DOT.test(moduleName);
        }
    };

    return ResolutionHelpers;
});
