/**
 * @namespace JARS~internals.Subjects
 */

/**
 * @typedef {(JARS~internals.Subjects.Module|JARS~internals.Subjects.Bundle)} Subject
 *
 * @memberof JARS~internals.Subjects
 * @inner
 */

/**
 * @typedef {(JARS~internals.Subjects.Dependencies.Module~Declaration|JARS~internals.Subjects.Bundle~Declaration)} Declaration
 *
 * @memberof JARS~internals.Subjects
 * @inner
 */
JARS.internalGroup('Subjects', ['Bundle', 'Dependencies', 'Interception', 'Module']);
