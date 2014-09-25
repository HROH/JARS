JAR.register({
    MID: 'jar.lang.operations',
    bundle: ['Arithmetic', 'Comparison', 'Bitwise', 'Logical']
}, function() {
    'use strict';

    var operations = {
        createOperation: function(operator, negate) {
            /*jslint evil: true */
            var operationString = (negate ? '!' : '') + '(a' + operator + 'b)';

            return new Function('a,b', 'return arguments.length === 2 ?' + operationString + ' : (b=a,function(a){return ' + operationString + '});');
        }
    };

    return operations;
});