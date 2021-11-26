JARS.internal('Traverser/Subjects', function(getInternal) {
    'use strict';

    var isRoot = getInternal('Resolvers/Subjects/Module').isRoot,
        Result = getInternal('Traverser/Result'),
        arrayEach = getInternal('Helpers/Array').each;

    /**
     * @memberof JARS~internals.Traverser
     *
     * @param {JARS~internals.Subjects.Subject} entrySubject
     * @param {JARS~internals.Traverser.Subjects~Handle} handle
     * @param {*} initialValue
     *
     * @return {*}
     */
    function Subjects(entrySubject, handle, initialValue) {
        return traverseSubject(entrySubject, entrySubject, handle, 0, initialValue).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Subjects
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entrySubject
     * @param {JARS~internals.Traverser.Subjects~Handle} handle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Result}
     */
    function traverseSubject(subject, entrySubject, handle, depth, value) {
        return handle.onLeave(subject, entrySubject, depth, handle.onEnter(subject, entrySubject, depth, value) ? traverseRelated(subject, entrySubject, handle, depth, value) : value);
    }

    /**
     * @memberof JARS~internals.Traverser.Subjects
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entrySubject
     * @param {JARS~internals.Traverser.Subjects~Handle} handle
     * @param {number} depth
     * @param {*} value
     *
     * @return {*}
     */
    function traverseRelated(subject, entrySubject, handle, depth, value) {
        var result = isRoot(subject.name) || isRoot(subject.parent.name) ? new Result(value) : traverseSubject(subject.parent, entrySubject, handle, depth, value);

        return (result.done ? result : traverseDependencies(subject, entrySubject, handle, depth, result.value)).value;
    }

    /**
     * @memberof JARS~internals.Traverser.Subjects
     * @inner
     *
     * @param {JARS~internals.Subjects.Subject} subject
     * @param {JARS~internals.Subjects.Subject} entrySubject
     * @param {JARS~internals.Traverser.Subjects~Handle} handle
     * @param {number} depth
     * @param {*} value
     *
     * @return {JARS~internals.Traverser.Result}
     */
    function traverseDependencies(subject, entrySubject, handle, depth, value) {
        var result;

        arrayEach(subject.dependencies.getAll(), function(nestedSubject) {
            result = traverseSubject(nestedSubject, entrySubject, handle, depth + 1, value);

            return result.done;
        });

        return result || new Result(value);
    }

    /**
     * @typedef {Object} Handle
     *
     * @memberof JARS~internals.Traverser.Subjects
     * @inner
     *
     * @method onEnter
     * @method onLeave
     */

    return Subjects;
});
