JARS.internal('Subjects/Dependencies/Interception', function(getInternal) {
    'use strict';

    var Dependencies = getInternal('Subjects/Dependencies/Module'),
        each = getInternal('Helpers/Object').each;

    /**
     * @class
     *
     * @memberof JARS~internals.Subjects.Dependencies
     *
     * @param {JARS~internals.Subjects.Module}
     */
    function Interception(module) {
        this.module = module;
        this._deps = {};
    }

    Interception.prototype = {
        constructor: Interception,
        /**
         * @param {string} interceptionName
         *
         * @return {JARS~internals.Subjects.Dependencies.Module}
         */
        get: function(interceptionName) {
            return this._deps[interceptionName] || (this._deps[interceptionName] = new Dependencies(this.module, true));
        },
        /**
         * @return {string[]}
         */
        getAll: function() {
            var dependencies = [];

            each(this._deps, function(dependency) {
                dependencies = dependencies.concat(dependency.getAll());
            });

            return dependencies;
        }
    };

    return Interception;
});
