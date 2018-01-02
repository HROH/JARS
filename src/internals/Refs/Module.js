JARS.internal('Refs/Module', function(getInternal) {
    'use strict';

    var FileNameResolver = getInternal('Resolvers/FileName'),
        setCurrent = getInternal('ModulesRegistry').setCurrent;

    function ModuleRef(module, refs, factory) {
        this._module = module;
        this._contexts = {};
        this._refs = refs;
        this._factory = factory || objectFactory;
    }

    ModuleRef.prototype = {
        constructor: ModuleRef,

        get: function(context) {
            context = context || this._module.config.get('context');

            return this._contexts[context] || this._create(context);
        },

        flush: function(context) {
            this._contexts[context] = null;
        },

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

    function objectFactory() {
        return {};
    }

    return ModuleRef;
});
