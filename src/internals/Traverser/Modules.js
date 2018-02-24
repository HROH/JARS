JARS.internal('Traverser/Modules', function(getInternal) {
    'use strict';

    var getModule = getInternal('Registries/Modules').get,
        isBundle = getInternal('Resolvers/Bundle').isBundle,
        each = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Traverser
     *
     * @param {JARS~internals.Subjects.Module} entryModule
     * @param {Object} traverseHandle
     * @param {*} initialValue
     *
     * @return {*}
     */
    function Modules(entryModule, traverseHandle, initialValue) {
        return traverseModule(entryModule, entryModule, traverseHandle, 0, initialValue).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Module} module
     * @param {JARS~internals.Subjects.Module} entryModule
     * @param {Object} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Modules~Result}
     */
    function traverseModule(module, entryModule, traverseHandle, depth, value) {
        if(traverseHandle.onModuleEnter(module, entryModule, depth, value)) {
            value = traverseDependencies(module, entryModule, traverseHandle, depth, value);
        }

        return traverseHandle.onModuleLeave(module, entryModule, depth, value);
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Module} module
     * @param {JARS~internals.Subjects.Module} entryModule
     * @param {Object} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {*}
     */
    function traverseDependencies(module, entryModule, traverseHandle, depth, value) {
        return traverseModules(module.deps.getAll().concat(module.interceptionDeps.getAll()), entryModule, traverseHandle, depth + 1, value).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Module} module
     * @param {JARS~internals.Subjects.Module} entryModule
     * @param {Object} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Modules~Result}
     */
    function traverseBundle(module, entryModule, traverseHandle, depth, value) {
        return traverseModules(module.bundle.modules, entryModule, traverseHandle, depth + 1, value);
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {string[]} modules
     * @param {JARS~internals.Subjects.Module} entryModule
     * @param {Object} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Modules~Result}
     */
    function traverseModules(modules, entryModule, traverseHandle, depth, value) {
        var result;

        each(modules, function(moduleName) {
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

    /**
     * @typedef {Object} Result
     *
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @property {*} value
     * @property {boolean} done
     */

    return Modules;
});
