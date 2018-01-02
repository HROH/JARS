(function globalSetup(envGlobal) {
    'use strict';

    var previousJARS = envGlobal.JARS,
        commands = [],
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
         * @memberof JARS.internals
         */
        Env = {
            /**
             * @type {object}
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
         * @memberof JARS.internals.Env
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
         * @memberof JARS.internals
         */
        SourceManager =  {
            /**
             * @param {string} moduleName
             * @param {string} path
             */
            load: function(moduleName, path) {
                var script = doc.createElement('script');

                head.appendChild(script);

                script.id = moduleName;
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
     * @borrows JARS.internals.InternalsManager.register as internal
     * @borrows JARS.internals.InternalsManager.registerGroup as internalGroup
     */
    envGlobal.JARS = JARS = {
        init: function(bootstrapInternalsManager) {
            var InternalsManager = bootstrapInternalsManager(commands);

            InternalsManager.register('Env', function() {
                return Env;
            });

            InternalsManager.register('SourceManager', function() {
                return SourceManager;
            });

            JARS.internal = InternalsManager.register;
            JARS.internalGroup = InternalsManager.registerGroup;

            pushCommand = function(command) {
                InternalsManager.queue.run(command);
            };

            InternalsManager.init();
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
         *
         * @return {JARS~ModuleWrapper}
         */
        module: delegate('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
            var dynamicInternalName = 'ModulesRegistry:' + moduleName,
                ModuleWrapper;

            delegate('InternalsManager', 'register')(dynamicInternalName, function internalModuleSetup(getInternal) {
                return getInternal('ModulesRegistry').get(moduleName);
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
                 * @param {JARS.internals.Dependencies.Declaration}
                 *
                 * @return {JARS~ModuleWrapper}
                 */
                $import: delegate(dynamicInternalName, '$import', returnSelf),
                /**
                 * @method
                 *
                 * @param {JARS.internals.Module.ModuleFactory} factory
                 */
                $export: delegate(dynamicInternalName, '$export')
            };

            function returnSelf() {
                return ModuleWrapper;
            }

            return ModuleWrapper;
        }),
        /**
         * @param {string} moduleName
         * @param {JARS.internals.Bundle.Declaration} bundle
         */
        moduleAuto: function(moduleName, bundle) {
            JARS.module(moduleName, bundle).$export();
        },

        configure: delegate('GlobalConfig', 'update', getJARS),

        computeSortedPathList: delegate('Resolvers/Path', 'computeSortedPathList', getJARS),

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
    SourceManager.load('InternalsManager', Env.INTERNALS_PATH + 'InternalsManager.js');

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
