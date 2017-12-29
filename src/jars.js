(function globalSetup(envGlobal) {
    'use strict';

    var previousJARS = envGlobal.JARS,
        JARS;

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

        group: {
            getKey: function(groupMember) {
                return groupMember.charAt(0).toLowerCase() + groupMember.substr(1);
            },

            getName: function(groupName, groupMember) {
                return groupName ? groupName + '/' + groupMember : groupMember;
            },

            each: function(groupList, callback) {
                for(var index = 0; index < groupList.length; index++) {
                    callback(groupList[index]);
                }
            }
        },

        queue: {
            counter: 0,

            loading: [],

            commands: [],

            addGroup: function(internalNames, groupName) {
                var group = InternalsManager.group;

                group.each(internalNames, function(internalName) {
                    InternalsManager.queue.add(group.getName(groupName, internalName));
                });
            },

            add: function(internalName) {
                InternalsManager.load(internalName);
                this.loading.push(internalName);
                this.counter++;
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
                InternalsManager.queue.run([internalName, methodName, Array.prototype.slice.call(arguments)]);

                return returnFn && returnFn.apply(null, arguments);
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
        registerGroup: function (groupName, groupList) {
            InternalsManager.queue.addGroup(groupList, groupName);

            InternalsManager.register(groupName, function internalGroupSetup(getInternal) {
                var group = InternalsManager.group,
                    result = {};

                group.each(groupList, function(groupMember) {
                    result[group.getKey(groupMember)] = getInternal(group.getName(groupName, groupMember));
                });

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
            InternalsManager.queue.addGroup([
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

    /**
     * @namespace
     * @global
     *
     * @borrows JARS.internals.InternalsManager.register as internal
     * @borrows JARS.internals.InternalsManager.registerGroup as internalGroup
     */
    envGlobal.JARS = JARS = {
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
        module: InternalsManager.delegate('ModulesRegistry', 'register', function returnModuleWrapper(moduleName) {
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
                $import: InternalsManager.delegate(dynamicInternalName, '$import', function returnSelf() {
                    return ModuleWrapper;
                }),
                /**
                 * @method
                 *
                 * @param {JARS.internals.Module.ModuleFactory} factory
                 */
                $export: InternalsManager.delegate(dynamicInternalName, '$export')
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

        configure: InternalsManager.delegate('GlobalConfig', 'update', getJARS),

        computeSortedPathList: InternalsManager.delegate('Resolvers/Path', 'computeSortedPathList', getJARS),

        flush: InternalsManager.delegate('Loader', 'flush', getJARS),
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
})(this);
