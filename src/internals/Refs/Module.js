JARS.internal('Refs/Module', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        setCurrent = getInternal('Registries/Modules').setCurrent;

    /**
     * @class
     *
     * @memberof JARS~internals.Refs
     *
     * @param {JARS~internals.Module} module
     * @param {JARS~internals.Refs.Modules} refs
     * @param {function()} factory
     */
    function Module(module, refs, factory) {
        this._module = module;
        this._contexts = {};
        this._refs = refs;
        this._factory = factory || objectFactory;
    }

    Module.prototype = {
        constructor: Module,
        /**
         * @param {string} [context]
         *
         * @return {*}
         */
        get: function(context) {
            context = context || this._module.config.get('context');

            return this._contexts[context] || this._create(context);
        },
        /**
         * @param {string} context
         */
        flush: function(context) {
            this._contexts[context] = null;
        },
        /**
         * @param {string} context
         *
         * @return {*}
         */
        _create: function(context) {
            var module = this._module,
                contexts = this._contexts,
                refs, parentRef;

            if(!module.isRoot) {
                refs = this._refs.get(context);
                parentRef = refs.shift();

                setCurrent(module);

                contexts[context] = parentRef[FileNameResolver(module.name)] = this._factory.apply(parentRef, refs) || {};

                setCurrent();
            }
            else {
                contexts[context] = {};
            }

            return contexts[context];
        }
    };

    /**
     * @memberof JARS~internals.Ref.Module
     * @inner
     *
     * @return {Object}
     */
    function objectFactory() {
        return {};
    }

    return Module;
});
