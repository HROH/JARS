JAR.register({
    MID: 'jar.lang.operations',
    deps: '.assert',
    bundle: ['Arithmetic', 'Comparison', 'Bitwise', 'Logical']
}, function(assert) {
    'use strict';

    var operations = {
        createOperation: function(operator, negate) {
            /*jslint evil: true */
            var operationString;
            
            assert(operator.length <= 6, 'Operator is too long!');
            
            operationString = (negate ? '!' : '') + '(a' + operator + 'b)';

            return new Function('a,b', 'return arguments.length === 2 ?' + operationString + ' : (b=a,function(a){return ' + operationString + '});');
        }
    };

    return operations;
});