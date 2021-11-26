(function globalSetup(envGlobal) {
    'use strict';

    var previousJARS = envGlobal.JARS,
        commands = [
            ['Bootstrappers/Modules', 'bootstrap'],
            ['Bootstrappers/Configs', 'bootstrap']
        ],
        pushCommand = function(command) {
            commands.push(command);
        },
        INTERNALS_REGISTRY = 'Registries/Internals',
        SUBJECTS_REGISTRY = 'Registries/Subjects',
        currentPlatform, JARS;

    /**
     * @namespace JARS~internals
     */

    /**
     * @namespace
     * @global
     *
     * @borrows JARS~internals.Registries.Internals.register as internal
     * @borrows JARS~internals.Registries.Internals.registerGroup as internalGroup
     */
    JARS = {
        /**
         * @param {Object} platform
         */
        platform: function(platform) {
            if(!currentPlatform) {
                currentPlatform = platform;
                JARS.main(platform.Env.MAIN_MODULE);
                platform.SourceManager.load(platform.Env.INTERNALS_PATH + INTERNALS_REGISTRY + '.js');
            }
        },
        /**
         * @param {function(JARS~internals.Registries.Internals~Command[]): JARS~internals.Registries.Internals} bootstrapInternalsRegistry
         */
        init: function(bootstrapInternalsRegistry) {
            var InternalsRegistry = bootstrapInternalsRegistry(commands);

            InternalsRegistry.register('Env', function() {
                return currentPlatform.Env;
            });

            InternalsRegistry.register('SourceManager', function() {
                return currentPlatform.SourceManager;
            });

            JARS.internal = InternalsRegistry.register;
            JARS.internalGroup = InternalsRegistry.registerGroup;

            pushCommand = InternalsRegistry.run;

            InternalsRegistry.init();
        },
        /**
         * @param {string} mainModule
         */
        main: function(mainModule) {
            mainModule && JARS.configure('main', mainModule);
        },
        /**
         * @method
         *
         * @param {string} moduleName
         * @param {JARS~internals.Subjects~Declaration} bundle
         *
         * @return {JARS~ModuleWrapper}
         */
        module: delegate(SUBJECTS_REGISTRY, 'registerModule', function(moduleName) {
            var dynamicInternalName = SUBJECTS_REGISTRY + ':' + moduleName,
                ModuleWrapper;

            delegate(INTERNALS_REGISTRY, 'register')(dynamicInternalName, function(getInternal) {
                return getInternal(SUBJECTS_REGISTRY).getSubject(moduleName);
            });

            /**
             * @namespace
             *
             * @memberof JARS
             * @inner
             */
            ModuleWrapper = {
                /**
                 * @method
                 *
                 * @param {Object}
                 *
                 * @return {JARS~ModuleWrapper}
                 */
                meta: delegate(dynamicInternalName, 'setMeta', returnSelf),
                /**
                 * @method
                 *
                 * @param {JARS~internals.Subjects~Declaration}
                 *
                 * @return {JARS~ModuleWrapper}
                 */
                $import: delegate(dynamicInternalName, '$import', returnSelf),
                /**
                 * @method
                 *
                 * @param {JARS~internals.Handlers.Completion.Dependencies~Provide} [provide]
                 * @param {JARS~internals.Handlers.Completion.Dependencies~Progress} [progress]
                 * @param {JARS~internals.Handlers.Completion.Dependencies~Error} [error]
                 *
                 * @return {JARS}
                 */
                $export: delegate(dynamicInternalName, '$export')
            };

            /**
             * @memberof JARS
             * @inner
             *
             * @return {JARS~ModuleWrapper}
             */
            function returnSelf() {
                return ModuleWrapper;
            }

            return ModuleWrapper;
        }),
        /**
         * @param {string} moduleName
         * @param {JARS~internals.Subjects~Declaration} bundle
         */
        moduleAuto: function(moduleName, bundle) {
            JARS.module(moduleName, bundle).$export();
        },
        /**
         * @method
         *
         * @param {(JARS~internals.Configs.Global~Option|JARS~internals.Configs.Global~Options)} optionOrConfig
         * @param {*} [valueOrArray]
         *
         * @return {JARS}
         */
        configure: delegate('Configs/Global', 'update'),
        /**
         * @method
         *
         * @param {string} entryModuleName
         * @param {function(string[])} callback
         *
         * @return {JARS}
         */
        computeSortedPathList: delegate('Resolvers/PathList', 'resolve'),
        /**
         * @method
         *
         * @param {string} scope
         * @param {string} switchToScope
         *
         * @return {JARS}
         */
        flush: delegate(SUBJECTS_REGISTRY, 'flush'),
        /**
         * @return {JARS}
         */
        noConflict: function() {
            envGlobal.JARS = previousJARS;

            return JARS;
        },
        /**
         * @const {string}
         * @default
         */
        version: '0.4.0'
    };

    envGlobal.JARS = JARS;

    /**
     * @param {string} internalName
     * @param {string} methodName
     * @param {function(...*)} returnFn
     *
     * @return {function(...*)}
     */
    function delegate(internalName, methodName, returnFn) {
        return function internalDelegator() {
            pushCommand([internalName, methodName, Array.prototype.slice.call(arguments)]);

            return returnFn ? returnFn.apply(null, arguments) : JARS;
        };
    }
})(typeof window === 'undefined' ? global : window);
