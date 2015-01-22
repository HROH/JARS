JAR.module('jar.lang.operations.Comparison').$import([
    '.::createOperation',
    '..Object!iterate',
    '..Enum'
]).$export(function(createOperation, Obj, Enum) {
    'use strict';

    /**
     * @access public
     * 
     * @namespace Comparison
     * @memberof jar.lang.operations
     */
    var Comparison = {
        operators: new Enum({
            Equal: {
                op: '==',

                alias: 'eq'
            },

            StrictEqual: {
                op: '===',

                alias: 'seq'
            },

            LowerThan: {
                op: '<',

                alias: 'lt'
            },

            LowerThanOrEqual: {
                op: '<=',

                alias: 'lte'
            },

            GreaterThan: {
                op: '>',

                alias: 'gt'
            },

            GreaterThanOrEqual: {
                op: '>=',

                alias: 'gte'
            }
        })
    };

    Obj.each(Comparison.operators.values(), function(comparator, comparisonName) {
        var operator = comparator.op,
            alias = comparator.alias,
            negatedOperator = '!' + (operator.indexOf('=') === 0 ? operator.substring(1) : operator);

        Comparison['is' + comparisonName] = Comparison[alias] = Comparison[operator] = createOperation(operator);
        Comparison['isNot' + comparisonName] = Comparison['n' + alias] = Comparison[negatedOperator] = createOperation(operator, true);
    });

    /**
     * @access public
     * 
     * @function isEqual
     * @alias eq
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isNotEqual
     * @alias neq
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isStrictEqual
     * @alias seq
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isNotStrictEqual
     * @alias nseq
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isLowerThan
     * @alias lt
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isNotLowerThan
     * @alias nlt
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isLowerThanOrEqual
     * @alias lte
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isNotLowerThanOrEqual
     * @alias nlte
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isGreaterThan
     * @alias gt
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isNotGreaterThan
     * @alias ngt
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isGreaterThanOrEqual
     * @alias gte
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    /**
     * @access public
     * 
     * @function isNotGreaterThanOrQual
     * @alias ngte
     * @memberof jar.lang.operations.Comparison
     * 
     * @param {*} value
     * @param {*} compareValue
     * 
     * @return {Boolean}
     */

    return Comparison;
});