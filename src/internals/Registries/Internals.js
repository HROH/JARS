JARS.init(function setupInternalsRegistry(commands) {
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
    var InternalsRegistry = {
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
                var group = InternalsRegistry.group;

                group.each(internalNames, function(internalName) {
                    InternalsRegistry.queue.add(group.getName(groupName, internalName));
                });
            },

            add: function(internalName) {
                if(!InternalsRegistry.factories[internalName]) {
                    InternalsRegistry.load(internalName);
                    this.loading.push(internalName);
                    this.counter++;
                }
            },

            mark: function(internalName) {
                if(this.loading.indexOf(internalName) !== -1 && --this.counter === 0) {
                    InternalsRegistry.get('Bootstrappers/Internal').bootstrap(this.commands);
                }
            },

            run: function(command) {
                this.counter ? this.commands.push(command) : InternalsRegistry.get('Bootstrappers/Internal').run(command);
            }
        },
        /**
         * @param {string} internalName
         * @param {JARS.internals.InternalsRegistry~InternalsFactory} factory
         */
        register: function(internalName, factory) {
            if(!InternalsRegistry.factories[internalName]) {
                InternalsRegistry.factories[internalName] = factory;

                InternalsRegistry.queue.mark(internalName);
            }
        },
        /**
         * @param {string} groupName
         * @param {string[]} group
         */
        registerGroup: function (groupName, groupList) {
            InternalsRegistry.queue.addGroup(groupList, groupName);

            InternalsRegistry.register(groupName, function internalGroupSetup(getInternal) {
                var group = InternalsRegistry.group,
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
            var factory = InternalsRegistry.factories[internalName];

            return factory && (factory.ref || (factory.ref = factory(InternalsRegistry.get)));
        },
        /**
         * @param {string} internalName
         */
        load: function(internalName) {
            InternalsRegistry.get('SourceManager').load('internal:' + internalName, InternalsRegistry.get('Env').INTERNALS_PATH + internalName + '.js');
        },
        /**
         * @method
         */
        init: function() {
            InternalsRegistry.queue.addGroup([
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
                'Traverser',
                'Type',
                'TypeLookup',
                'Utils'
            ]);

            while(commands.length) {
                InternalsRegistry.queue.run(commands.shift());
            }
        }
    };

    /**
     * @callback InternalsFactory
     *
     * @memberof JARS.internals.InternalsRegistry
     * @inner
     *
     * @param {JARS.internals.InternalsRegistry.get} getInternal
     *
     * @return {*}
     */

    InternalsRegistry.register('Registries/Internals', function() {
        return InternalsRegistry;
    });

    return InternalsRegistry;
});
