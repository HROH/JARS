JARS.module('System.Modules').$export(function() {
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
        /**
         * @access public
         *
         * @memberof System.Modules
         *
         * @param {String} moduleName
         *
         * @return {*}
         */
        use: function(moduleName) {
            return Loader.getModuleRef(moduleName);
        },

        $import: Loader.$import,

        getCurrentModuleData: Loader.getCurrentModuleData
    };

    return Modules;
});
