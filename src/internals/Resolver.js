JARS.internal('Resolver', function resolverSetup(InternalsManager) {
    'use strict';

    var ROOT_MODULE_NAME = '*',
        DOT = '.',
        VersionResolver = InternalsManager.get('VersionResolver'),
        Resolver;

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    Resolver = {
        /**
         * @param {string} moduleName
         *
         * @return {boolean}
         */
        isRootName: function(moduleName) {
            return ROOT_MODULE_NAME === moduleName;
        },
        /**
         * @return {string}
         */
        getRootName: function() {
            return ROOT_MODULE_NAME;
        },
        /**
         * @param {string} moduleName
         *
         * @return {string}
         */
        getModuleTail: function(moduleName) {
            return VersionResolver.removeVersion(moduleName).split(DOT).pop();
        }
    };

    return Resolver;
});
