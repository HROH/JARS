(function globalSetup(envGlobal) {
    'use strict';

    /**
     * @namespace internals
     *
     * @memberof JARS
     */

    /**
     * @namespace
     *
     * @memberof JARS.internals
     */
    var InternalsManager = {
        factories: {},

        queue: {
            counter: 0,

            loading: [],

            commands: [],

            add: function(internalNames) {
                for(var index = 0; index < internalNames.length; index++) {
                    InternalsManager.load(internalNames[index]);
                }

                this.loading = this.loading.concat(internalNames);
                this.counter += internalNames.length;
            },

            mark: function(internalName) {
                if(this.loading.indexOf(internalName) != -1 && --this.counter === 0) {
                    InternalsManager.get('InternalBootstrapper').bootstrap(this.commands);
                }
            },

            run: function(command) {
                this.counter ? this.commands.push(command) : InternalsManager.get('InternalBootstrapper').run(command);
            }
        },
        /**
         * @param {string} internalName
         * @param {string} methodName
         * @param {function()} returnFn
         *
         * @return {function()}
         */
        delegate: function(internalName, methodName, returnFn) {
            return function internalDelegator() {
                var args = Array.prototype.slice.call(arguments);

                InternalsManager.queue.run([internalName, methodName, args]);

                return returnFn && returnFn.apply(null, args);
            };
        },
        /**
         * @param {string} internalName
         * @param {JARS.internals.InternalsManager~InternalsFactory} factory
         */
        register: function(internalName, factory) {
            if(!InternalsManager.factories[internalName]) {
                InternalsManager.factories[internalName] = factory;

                InternalsManager.queue.mark(internalName);
            }
        },
        /**
         * @param {string} groupName
         * @param {string[]} group
         */
        registerGroup: function (groupName, group) {
            var internalNames = [],
                index;

            for(index = 0; index < group.length; index++) {
                internalNames.push(groupName + '/' + group[index]);
            }

            InternalsManager.queue.add(internalNames);

            InternalsManager.register(groupName, function internalGroupSetup(getInternal) {
                var result = {};

                for(index = 0; index < internalNames.length; index++) {
                    result[group[index].charAt(0).toLowerCase() + group[index].substr(1)] = getInternal(internalNames[index]);
                }

                return result;
            });
        },
        /**
         * @param {string} internalName
         *
         * @return {*}
         */
        get: function (internalName) {
            var factory = InternalsManager.factories[internalName];

            return factory && (factory.ref || (factory.ref = factory(InternalsManager.get)));
        },
        /**
         * @param {string} internalName
         */
        load: function(internalName) {
            InternalsManager.get('SourceManager').load('internal:' + internalName, InternalsManager.get('Env').INTERNALS_PATH + internalName + '.js');
        },
        /**
         * @method
         */
        init: function() {
            InternalsManager.queue.add([
                'AutoAborter',
                'Bundle',
                'Config',
                'ConfigOptions',
                'ConfigTransforms',
                'Dependencies',
                'DependenciesChecker',
                'GlobalConfig',
                'GlobalConfigHooks',
                'Handlers',
                'Interception',
                'InterceptorRegistry',
                'Interceptors',
                'InternalBootstrapper',
                'Loader',
                'LogWrap',
                'Module',
                'ModulesRegistry',
                'Processors',
                'Recoverer',
                'ResolutionStrategies',
                'Resolvers',
                'State',
                'StateInfo',
                'System',
                'SystemBootstrapper',
                'Tools',
                'Type',
                'TypeLookup',
                'TypeStrategies',
                'Utils'
            ]);
        }
    };

    /**
     * @callback InternalsFactory
     *
     * @memberof JARS.internals.InternalsManager
     * @inner
     *
     * @param {JARS.internals.InternalsManager.get} getInternal
     *
     * @return {*}
     */

    InternalsManager.register('InternalsManager', function() {
        return InternalsManager;
    });

    InternalsManager.register('Env', function envConfigSetup() {
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
    });

    InternalsManager.register('SourceManager', function sourceManagerSetup() {
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
    });

    InternalsManager.init();

    envGlobal.JARS = (function jarsSetup() {
        var delegateToInternal = InternalsManager.delegate,
            previousJARS = envGlobal.JARS,
            JARS;

        /**
         * @namespace
         * @global
         *
         * @borrows JARS.internals.InternalsManager.register as internal
         * @borrows JARS.internals.InternalsManager.registerGroup as internalGroup
         */
        JARS = {
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
            module: delegateToInternal('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
                var dynamicInternalName = 'ModulesRegistry:' + moduleName,
                    ModuleWrapper;

                InternalsManager.register(dynamicInternalName, function internalModuleSetup(getInternal) {
                    return getInternal('ModulesRegistry').get(moduleName);
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
                     * @param {JARS.internals.Dependencies.Declaration}
                     *
                     * @return {JARS~ModuleWrapper}
                     */
                    $import: delegateToInternal(dynamicInternalName, '$import', function returnSelf() {
                        return ModuleWrapper;
                    }),
                    /**
                     * @method
                     *
                     * @param {JARS.internals.Module.ModuleFactory} factory
                     */
                    $export: delegateToInternal(dynamicInternalName, '$export')
                };

                return ModuleWrapper;
            }),
            /**
             * @param {string} moduleName
             * @param {JARS.internals.Bundle.Declaration} bundle
             */
            moduleAuto: function(moduleName, bundle) {
                JARS.module(moduleName, bundle).$export();
            },

            internal: InternalsManager.register,

            internalGroup: InternalsManager.registerGroup,

            configure: delegateToInternal('GlobalConfig', 'update', getJARS),

            computeSortedPathList: delegateToInternal('Resolvers/Path', 'computeSortedPathList', getJARS),

            flush: delegateToInternal('Loader', 'flush', getJARS),
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

        JARS.main(InternalsManager.get('Env').MAIN_MODULE);

        /**
         * @memberof JARS
         * @inner
         *
         * @return {JARS}
         */
        function getJARS() {
            return JARS;
        }

        return JARS;
    })();
})(this);
