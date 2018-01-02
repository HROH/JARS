JARS.init(function setupInternalsManager(commands) {
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
                    InternalsManager.get('Bootstrappers/Internal').bootstrap(this.commands);
                }
            },

            run: function(command) {
                this.counter ? this.commands.push(command) : InternalsManager.get('Bootstrappers/Internal').run(command);
            }
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
                'Bootstrappers',
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
                'InterceptionDependencies',
                'Interceptors',
                'Loader',
                'LogWrap',
                'Module',
                'Processors',
                'Recoverer',
                'Refs',
                'Registries',
                'Resolvers',
                'State',
                'StateInfo',
                'Strategies',
                'System',
                'Tools',
                'Type',
                'TypeLookup',
                'Utils'
            ]);

            while(commands.length) {
                InternalsManager.queue.run(commands.shift());
            }
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

    return InternalsManager;
});
