JAR.register({
    MID: 'jar.lang.operations',
    deps: ['.assert', '.Enum'],
    bundle: ['Arithmetic', 'Comparison', 'Bitwise', 'Logical']
}, function(assert, Enum) {
    'use strict';

    var operationPlaceholder = '${op}',
        rOperationPlaceholder = /\$\{op\}/g,
        operands, firstOperand, secondOperand, operationBody, operations;

    operands = new Enum({
        first: 'a',

        second: 'b'
    });

    firstOperand = operands.first;
    secondOperand = operands.second;
    operationBody = ['return arguments.length==2?', operationPlaceholder, ':(', secondOperand, '=', firstOperand, ',function(', firstOperand, '){return ', operationPlaceholder, '})'].join('');

    operations = {
        operands: operands,

        createOperation: function(operator, negate) {
            /*jslint evil: true */
            assert(operator.length <= 6, 'Operator is too long!');

            return new Function(firstOperand, secondOperand, operationBody.replace(rOperationPlaceholder, [negate ? '!' : '', '(', firstOperand, operator, secondOperand, ')'].join('')));
        }
    };

    return operations;
});