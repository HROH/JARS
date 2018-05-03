JARS.internal('Traverser/Modules', function(getInternal) {
    'use strict';

    var Result = getInternal('Traverser/Result'),
        arrayEach = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Traverser
     *
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} handle
     * @param {*} initialValue
     *
     * @return {*}
     */
    function Modules(entryModule, handle, initialValue) {
        return traverseSubject(entryModule, entryModule, handle, 0, initialValue).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} handle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Result}
     */
    function traverseSubject(subject, entryModule, handle, depth, value) {
        return handle.onLeave(subject, entryModule, depth, handle.onEnter(subject, entryModule, depth, value) ? traverseRelated(subject, entryModule, handle, depth, value) : value);
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} handle
     * @param {number} depth
     * @param {*} value
     *
     * @return {*}
     */
    function traverseRelated(subject, entryModule, handle, depth, value) {
        var result = subject.isRoot || subject.parent.isRoot ? new Result(value) : traverseSubject(subject.parent, entryModule, handle, depth, value);

        return (result.done ? result : traverseDependencies(subject, entryModule, handle, depth, result.value)).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Modules
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entryModule
     * @param {JARS~internals.Traverser.Modules~Handle} handle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Result}
     */
    function traverseDependencies(subject, entryModule, handle, depth, value) {
        var result;

        arrayEach(subject.dependencies.getAll(), function(nestedSubject) {
            result = traverseSubject(nestedSubject, entryModule, handle, depth + 1, value);

            return result.done;
        });

        return result || new Result(value);
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

    return Modules;
});
