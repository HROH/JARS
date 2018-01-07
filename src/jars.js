(function globalSetup(envGlobal) {
    'use strict';

    var previousJARS = envGlobal.JARS,
        commands = [
            ['Bootstrappers/Modules', 'bootstrap'],
            ['Bootstrappers/Configs', 'bootstrap'],
            ['Bootstrappers/System', 'bootstrap']
        ],
        pushCommand = function(command) {
            commands.push(command);
        },
        Env, SourceManager, JARS;

    Env = (function envConfigSetup() {
        var scripts = envGlobal.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            BASE_PATH = getData('base') || script.src.substring(0, script.src.lastIndexOf('/') + 1),
            Env;

        /**
         * @namespace
         *
         * @memberof JARS~internals
         */
        Env = {
            /**
             * @type {Global}
             */
            global: envGlobal,
            /**
             * @type {string}
             */
            MAIN_MODULE: getData('main'),
            /**
             * @type {string}
             */
            BASE_PATH: BASE_PATH,
            /**
             * @type {string}
             */
            INTERNALS_PATH: getData('internals') || (BASE_PATH + 'internals/'),
        };

        /**
         * @memberof JARS~internals.Env
         * @inner
         *
         * @param {string} key
         *
         * @return {string}
         */
        function getData(key) {
            return script.getAttribute('data-' + key);
        }

        return Env;
    })();

    SourceManager = (function sourceManagerSetup() {
        var doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
            SourceManager;

        /**
         * @namespace
         *
         * @memberof JARS~internals
         */
        SourceManager =  {
            /**
             * @param {string} path
             */
            load: function(path) {
                var script = doc.createElement('script');

                head.appendChild(script);

                script.type = 'text/javascript';
                script.src = path;
                script.async = true;
            }
        };

        return SourceManager;
    })();

    /**
     * @namespace
     * @global
     *
     * @borrows JARS~internals.Registries.Internals.register as internal
     * @borrows JARS~internals.Registries.Internals.registerGroup as internalGroup
     */
    envGlobal.JARS = JARS = {
        /**
         * @param {function()} bootstrapInternalsRegistry
         */
        init: function(bootstrapInternalsRegistry) {
            var InternalsRegistry = bootstrapInternalsRegistry(commands);

            InternalsRegistry.register('Env', function() {
                return Env;
            });

            InternalsRegistry.register('SourceManager', function() {
                return SourceManager;
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
         * @param {JARS~internals.Bundle~Declaration} bundle
         *
         * @return {JARS~ModuleWrapper}
         */
        module: delegate('Registries/Modules', 'register', function returnModuleWrapper(moduleName) {
            var dynamicInternalName = 'ModulesRegistry:' + moduleName,
                ModuleWrapper;

            delegate('Registries/Internals', 'register')(dynamicInternalName, function(getInternal) {
                return getInternal('Registries/Modules').get(moduleName);
            });

            /**
             * @namespace
             *
             * @memberof JARS
             * @inner
             */
            ModuleWrapper = {
                meta: delegate(dynamicInternalName, 'setMeta', returnSelf),
                /**
                 * @method
                 *
                 * @param {JARS~internals.Dependencies~Declaration}
                 *
                 * @return {JARS~ModuleWrapper}
                 */
                $import: delegate(dynamicInternalName, '$import', returnSelf),
                /**
                 * @method
                 *
                 * @param {JARS~internals.Module~Factory} factory
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
         * @param {JARS~internals.Bundle~Declaration} bundle
         */
        moduleAuto: function(moduleName, bundle) {
            JARS.module(moduleName, bundle).$export();
        },
        /**
         * @param {(JARS~internals.Configs.Global~Option|JARS~internals.Configs.Global~Options)} optionOrConfigOrArray
         * @param {*} [valueOrArray]
         *
         * @return {JARS}
         */
        configure: delegate('Configs/Global', 'update', getJARS),
        /**
         * @param {string} entryModuleName
         * @param {function(string[])} callback
         *
         * @return {JARS}
         */
        computeSortedPathList: delegate('Resolvers/PathList', 'computeSortedPathList', getJARS),
        /**
         * @param {string} context
         * @param {string} switchToContext
         *
         * @return {JARS}
         */
        flush: delegate('Loader', 'flush', getJARS),
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
        version: '0.3.0'
    };

    JARS.main(Env.MAIN_MODULE);
    SourceManager.load(Env.INTERNALS_PATH + 'Registries/Internals.js');

    /**
     * @param {string} internalName
     * @param {string} methodName
     * @param {function()} returnFn
     *
     * @return {function()}
     */
    function delegate(internalName, methodName, returnFn) {
        return function internalDelegator() {
            pushCommand([internalName, methodName, Array.prototype.slice.call(arguments)]);

            return returnFn && returnFn.apply(null, arguments);
        };
    }

    /**
     * @memberof JARS
     * @inner
     *
     * @return {JARS}
     */
    function getJARS() {
        return JARS;
    }
})(this);
