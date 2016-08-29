JARS.module('System.Modules').$export(function systemModulesFactory() {
    'use strict';

    var internals = this.$$internals,
        arrayEach = internals.get('utils').arrayEach,
        Loader = internals.get('Loader'),
        Resolver = internals.get('Resolver'),
        Modules;

    /**
     * @namespace System.Modules
     */
    Modules = {
        /**
         * @access public
         *
         * @memberof System.Modules
         *
         * @param {(Object|Array|String)} moduleNames
         *
         * @return {Array}
         */
        useAll: function(moduleNames) {
            var refs = [];

            moduleNames = Resolver.resolve(moduleNames);

            arrayEach(moduleNames, function use(moduleName) {
                refs.push(Modules.use(moduleName));
            });

            return refs;
        },
        
        use: Loader.getModuleRef,

        $import: Loader.$import,

        getCurrentModuleData: Loader.getCurrentModuleData
    };

    return Modules;
});
