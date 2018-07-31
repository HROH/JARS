JARS.init(function(commands) {
    'use strict';

    var internals = {},
        Internals, Queue, Group;

    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries
     */
    Internals = {
        /**
         * @param {string} internalName
         * @param {JARS~internals.Registries.Internals~Factory} factory
         */
        register: function(internalName, factory) {
            if(!internals[internalName]) {
                internals[internalName] = factory;

                Queue.mark(internalName) && Internals.runAll();
            }
        },
        /**
         * @param {string} groupName
         * @param {string[]} groupList
         */
        registerGroup: function(groupName, groupList) {
            Queue.addGroup(groupList, groupName);

            Internals.register(groupName, function(getInternal) {
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
        get: function(internalName) {
            var factory = internals[internalName];

            return factory && (factory.ref || (factory.ref = factory(Internals.get)));
        },
        /**
         * @param {string} internalName
         */
        load: function(internalName) {
            Internals.get('SourceManager').load(Internals.get('Env').INTERNALS_PATH + internalName + '.js');
        },
        /**
         * @param {JARS~internals.Registries.Internals~Command} command
         */
        run: function(command) {
            var internal;

            if(Queue.counter) {
                commands.push(command);
            } else {
                internal = Internals.get(command[0]);
                internal[command[1]].apply(internal, command[2]);
            }
        },
        /**
         * @method
         */
        runAll: function() {
            while(commands.length) {
                Internals.run(commands.shift());
            }
        },
        /**
         * @method
         */
        init: function() {
            Queue.addGroup([
                'Bootstrappers',
                'Configs',
                'Factories',
                'Handlers',
                'Helpers',
                'Interceptors',
                'Logger',
                'Refs',
                'Registries',
                'Resolvers',
                'State',
                'Strategies',
                'Subjects',
                'Traverser',
                'Types'
            ]);
        }
    };

    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries.Internals
     * @inner
     */
    Group = {
        /**
         * @param {string} groupMember
         */
        getKey: function(groupMember) {
            return groupMember.charAt(0).toLowerCase() + groupMember.substr(1);
        },
        /**
         * @param {string} groupName
         * @param {string} groupMember
         *
         * @return {string}
         */
        getName: function(groupName, groupMember) {
            return groupName ? groupName + '/' + groupMember : groupMember;
        },
        /**
         * @param {string[]} groupList
         * @param {function(string)} callback
         */
        each: function(groupList, callback) {
            var index = 0;

            for(index; index < groupList.length; index++) {
                callback(groupList[index]);
            }
        }
    };

    /**
     * @namespace
     *
     * @memberof JARS~internals.Registries.Internals
     * @inner
     */
    Queue = {
        counter: 0,

        loading: {},
        /**
         * @param {string[]} internalNames
         * @param {string} groupName
         */
        addGroup: function(internalNames, groupName) {
            Group.each(internalNames, function(internalName) {
                Queue.add(Group.getName(groupName, internalName));
            });
        },
        /**
         * @param {string} internalName
         */
        add: function(internalName) {
            if(!internals[internalName]) {
                Internals.load(internalName);
                Queue.loading[internalName] = true;
                Queue.counter++;
            }
        },
        /**
         * @param {string} internalName
         *
         * @return {boolean}
         */
        mark: function(internalName) {
            return Queue.loading[internalName] && --Queue.counter === 0;
        }
    };

    /**
     * @callback Factory
     *
     * @memberof JARS~internals.Registries.Internals
     * @inner
     *
     * @param {JARS~internals.Registries.Internals.get} getInternal
     *
     * @return {*}
     */

    /**
     * @typedef {Array} Command
     *
     * @memberof JARS~internals.Registries.Internals
     * @inner
     */

    Internals.register('Registries/Internals', function() {
        return Internals;
    });

    return Internals;
});
