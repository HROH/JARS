JARS.internal('InterceptionDependencies', function(getInternal) {
    'use strict';

    var Dependencies = getInternal('Dependencies'),
        objectEach = getInternal('Utils').objectEach;

    function InterceptionDependencies(module) {
        this.module = module;
        this._deps = {};
    }

    InterceptionDependencies.prototype = {
        constructor: InterceptionDependencies,

        get: function(interceptionName) {
            return this._deps[interceptionName] || (this._deps[interceptionName] = new Dependencies(this.module));
        },

        getAll: function() {
            var dependencies = [];

            objectEach(this._deps, function(dependency) {
                dependencies = dependencies.concat(dependency.getAll());
            });

            return dependencies;
        }
    };

    return InterceptionDependencies;
});
