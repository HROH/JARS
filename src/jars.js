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
        Env, SourceManager, JARS;

    /**
     * @namespace JARS~internals
     */

    Env = (function envConfigSetup() {
        var scripts = envGlobal.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
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
            BASE_PATH: getData('base') || './',
            /**
             * @type {string}
             */
            INTERNALS_PATH: getData('internals') || script.src.substring(0, script.src.lastIndexOf('/')) + '/internals/'
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
        SourceManager = {
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
    JARS = {
        /**
         * @param {function(JARS~internals.Registries.Internals~Command[]): JARS~internals.Registries.Internals} bootstrapInternalsRegistry
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
         * @param {JARS~internals.Subjects~Declaration} bundle
         *
         * @return {JARS~ModuleWrapper}
         */
        module: delegate('Registries/Subjects', 'registerModule', function(moduleName) {
            var dynamicInternalName = 'Registries/Subjects:' + moduleName,
                ModuleWrapper;

            delegate('Registries/Internals', 'register')(dynamicInternalName, function(getInternal) {
                return getInternal('Registries/Subjects').get(moduleName);
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
                 * @param {JARS~internals.Subjects.Subject~Provide} provide
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
         * @param {string} context
         * @param {string} switchToContext
         *
         * @return {JARS}
         */
        flush: delegate('Registries/Subjects', 'flush'),
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

    JARS.main(Env.MAIN_MODULE);
    SourceManager.load(Env.INTERNALS_PATH + 'Registries/Internals.js');

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
})(this);
