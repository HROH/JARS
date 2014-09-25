JAR.register({
    MID: 'jar.lang.operations.Arithmetic',
    deps: '..Object!iterate'
}, function(Obj) {
    'use strict';

    var operations = this,
        Arithmetic = {},
        arithmeticOperators = {
            add: '+',

            subtract: '-',

            multiplyWith: '*',

            divideBy: '/',

            modulo: '%'
        };

    Obj.each(arithmeticOperators, function(arithmeticOperator, arithmeticOperationName) {
        Arithmetic[arithmeticOperationName] = Arithmetic[arithmeticOperator] = operations.createOperation(arithmeticOperator);
    });

    return Arithmetic;
});