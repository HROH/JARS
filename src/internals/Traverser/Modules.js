JARS.internal('Traverser/Modules', function(getInternal) {
    'use strict';

    var getModule = getInternal('Registries/Modules').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        arrayEach = getInternal('Utils').arrayEach,
        ModulesTraverser;

    ModulesTraverser = {
        traverse: function(entryModule, traverseHandle, initialValue) {
            return traverseModule(entryModule, entryModule, traverseHandle, 0, initialValue).value;
        }
    };

    function traverseModule(module, entryModule, traverseHandle, depth, value) {
        if(traverseHandle.onModuleEnter(module, entryModule, depth, value)) {
            value = traverseDependencies(module, entryModule, traverseHandle, depth, value);
        }

        return traverseHandle.onModuleLeave(module, entryModule, depth, value);
    }

    function traverseDependencies(module, entryModule, traverseHandle, depth, value) {
        return traverseModules(module.deps.getAll().concat(module.interceptionDeps.getAll()), entryModule, traverseHandle, depth + 1, value).value;
    }

    function traverseBundle(module, entryModule, traverseHandle, depth, value) {
        return traverseModules(module.bundle.modules, entryModule, traverseHandle, depth + 1, value);
    }

    function traverseModules(modules, entryModule, traverseHandle, depth, value) {
        var result;

        arrayEach(modules, function(moduleName) {
            var module = getModule(moduleName);

            result = traverseModule(module, entryModule, traverseHandle, depth, value);
            isBundle(moduleName) && (result = traverseBundle(module, entryModule, traverseHandle, depth, result.value));

            return result.done;
        });

        return result || {
            value: value,

            done: false
        };
    }

    return ModulesTraverser;
});
