/**
 * @namespace JARS~internals.Strategies.Resolution
 */

/**
 * @callback Strategy
 *
 * @memberof JARS~internals.Strategies.Resolution
 * @inner
 *
 * @param {JARS~internals.Subject} subject
 * @param {string} subjectName
 *
 * @return {{error: string, name: string}}
 */
JARS.internalGroup('Strategies/Resolution', ['Absolute', 'Bundle', 'Nested', 'Relative', 'Subject', 'Version']);
