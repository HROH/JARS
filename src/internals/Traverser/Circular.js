JARS.internal('Traverser/Circular', function() {
    'use strict';

    var CircularTraverser = {
        onModuleEnter: function(module, entryModule, depth) {
            return !equalsEntryModule(module, entryModule, depth) && (module.state.isRegistered() || module.state.isIntercepted());
        },

        onModuleLeave: function(module, entryModule, depth, value) {
            (value || (equalsEntryModule(module, entryModule, depth) && (value = []))) && value.push(module.name);

            return {
                value: value,

                done: !!value
            };
        }
    };

    function equalsEntryModule(module, entryModule, depth) {
        return depth && module === entryModule;
    }

    return CircularTraverser;
});
