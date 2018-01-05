JARS.init(function setupInternalsRegistry(commands) {
    'use strict';

    var internals = {},
        InternalsRegistry, Queue, Group;

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
    InternalsRegistry = {
        /**
         * @param {string} internalName
         * @param {JARS.internals.InternalsRegistry~InternalsFactory} factory
         */
        register: function(internalName, factory) {
            if(!internals[internalName]) {
                internals[internalName] = factory;

                Queue.mark(internalName) && InternalsRegistry.runAll();
            }
        },
        /**
         * @param {string} groupName
         * @param {string[]} group
         */
        registerGroup: function (groupName, groupList) {
            Queue.addGroup(groupList, groupName);

            InternalsRegistry.register(groupName, function internalGroupSetup(getInternal) {
                var result = {};

                Group.each(groupList, function(groupMember) {
                    result[Group.getKey(groupMember)] = getInternal(Group.getName(groupName, groupMember));
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
            var factory = internals[internalName];

            return factory && (factory.ref || (factory.ref = factory(InternalsRegistry.get)));
        },
        /**
         * @param {string} internalName
         */
        load: function(internalName) {
            InternalsRegistry.get('SourceManager').load('internal:' + internalName, InternalsRegistry.get('Env').INTERNALS_PATH + internalName + '.js');
        },

        run: function(command) {
            var internal;

            if(Queue.counter) {
                commands.push(command);
            } else {
                internal = InternalsRegistry.get(command[0]);
                internal[command[1]].apply(internal, command[2]);
            }
        },

        runAll: function() {
            while(commands.length) {
                InternalsRegistry.run(commands.shift());
            }
        },
        /**
         * @method
         */
        init: function() {
            Queue.addGroup([
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
        }
    };

    Group = {
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
    };

    Queue = {
        counter: 0,

        loading: [],

        addGroup: function(internalNames, groupName) {
            Group.each(internalNames, function(internalName) {
                Queue.add(Group.getName(groupName, internalName));
            });
        },

        add: function(internalName) {
            if(!internals[internalName]) {
                InternalsRegistry.load(internalName);
                Queue.loading.push(internalName);
                Queue.counter++;
            }
        },

        mark: function(internalName) {
            return Queue.loading.indexOf(internalName) !== -1 && --Queue.counter === 0;
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
