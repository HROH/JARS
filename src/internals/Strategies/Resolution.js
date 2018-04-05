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
 * @return {JARS~internals.Strategies.Resolution~Data}
 */

/**
 * @typedef {Object} JARS~internals.Strategies.Resolution~Data
 *
 * @property {string} name
 * @property {string} error
 */
JARS.internalGroup('Strategies/Resolution', ['Absolute', 'Bundle', 'Nested', 'Relative', 'Subject']);
