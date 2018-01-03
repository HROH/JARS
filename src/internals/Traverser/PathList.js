JARS.internal('Traverser/PathList', function(getInternal) {
    'use strict';

    var getFullPath = getInternal('Resolvers/Path').getFullPath,
        PathListTraverser;

    PathListTraverser = {
        onModuleEnter: function(module, entryModule, depth, value) {
            return !isModuleSorted(module, value) && module.state.isLoaded();
        },

        onModuleLeave: function(module, entryModule, depth, value) {
            if(!isModuleSorted(module, value)) {
                value.sorted[module.name] = true;
                value.paths.push(getFullPath(module));
            }

            return {
                value: value,

                done: false
            };
        }
    };

    function isModuleSorted(module, value) {
        return value.sorted[module.name];
    }

    return PathListTraverser;
});
