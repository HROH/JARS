JAR.module('jar.lang.operations.Arithmetic').$import([
    '.::createOperation',
    '..Object!iterate',
    '..Enum'
]).$export(function(createOperation, Obj, Enum) {
    'use strict';

    var Arithmetic = {
        operators: new Enum({
            add: '+',

            subtract: '-',

            multiplyWith: '*',

            divideBy: '/',

            modulo: '%'
        })
    };

    Obj.each(Arithmetic.operators.values(), function(arithmeticOperator, arithmeticOperationName) {
        Arithmetic[arithmeticOperationName] = Arithmetic[arithmeticOperator] = createOperation(arithmeticOperator);
    });

    return Arithmetic;
});