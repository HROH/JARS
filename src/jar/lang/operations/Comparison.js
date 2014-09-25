JAR.register({
    MID: 'jar.lang.operations.Comparison',
    deps: '..Object!iterate'
}, function(Obj) {
    'use strict';
    var operations = this,
        comparators = {
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
        },
        Comparison;

    /**
     * @access public
     * 
     * @namespace Comparison
     * @memberof jar.lang.operations
     */
    Comparison = {};

    Obj.each(comparators, function(comparator, comparisonName) {
        var operator = comparator.op;
        
        Comparison['is' + comparisonName] = Comparison[comparator.alias] = Comparison[operator] = operations.createOperation(operator);
        Comparison['isNot' + comparisonName] = Comparison['n' + comparator.alias] = Comparison['!' + (operator.indexOf('=') === 0 ? operator.substring(1) : operator)] = operations.createOperation(operator, true);
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