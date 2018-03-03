JARS.internal('Traverser/Modules', function(getInternal) {
    'use strict';

    var arrayEach = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Traverser
     *
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} traverseHandle
     * @param {*} initialValue
     *
     * @return {*}
     */
    function Modules(entryModule, traverseHandle, initialValue) {
        return traverseSubject(entryModule, entryModule, traverseHandle, 0, initialValue).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Modules~Result}
     */
    function traverseSubject(subject, entryModule, traverseHandle, depth, value) {
        if(traverseHandle.onEnter(subject, entryModule, depth, value)) {
            value = traverseRelated(subject, entryModule, traverseHandle, depth, value);
        }

        return traverseHandle.onLeave(subject, entryModule, depth, value);
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {*}
     */
    function traverseRelated(subject, entryModule, traverseHandle, depth, value) {
        var result = (subject.isRoot || subject.parent.isRoot) ? defaultResult(value) : traverseSubject(subject.parent, entryModule, traverseHandle, depth, value);

        if(!result.done) {
            result = traverseDependencies(subject, entryModule, traverseHandle, depth, result.value);
        }

        return result.value;
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} traverseHandle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Modules~Result}
     */
    function traverseDependencies(subject, entryModule, traverseHandle, depth, value) {
        var result;

        arrayEach(subject.dependencies.getAll(), function(nestedSubject) {
            result = traverseSubject(nestedSubject, entryModule, traverseHandle, depth + 1, value);

            return result.done;
        });

        return result || defaultResult(value);
    }

    /**
     * 
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Modules~Result}
     */
    function defaultResult(value) {
        return {
            value: value,

            done: false
        };
    }

    /**
     * @typedef {Object} Handle
     *
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @method onEnter
     * @method onLeave
     */

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
