JAR.register({
    MID: 'jar.lang.operations.Arithmetic',
    deps: ['.::createOperation', '..Object!iterate']
}, function(createOperation, Obj) {
    'use strict';

    var Arithmetic = {},
        arithmeticOperators = {
            add: '+',

            subtract: '-',

            multiplyWith: '*',

            divideBy: '/',

            modulo: '%'
        };

    Obj.each(arithmeticOperators, function(arithmeticOperator, arithmeticOperationName) {
        Arithmetic[arithmeticOperationName] = Arithmetic[arithmeticOperator] = createOperation(arithmeticOperator);
    });

    return Arithmetic;
});