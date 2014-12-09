JAR.register({
    MID: 'jar.lang.operations.Bitwise',
    deps: ['.::createOperation', '..Object!iterate', '..Enum']
}, function(createOperation, Obj, Enum) {
    'use strict';

    var Bitwise = {
        operators: new Enum({
            and: '&',

            or: '|',

            xor: '^',

            leftShift: '<<',

            rightShiftDrop: '>>',

            rightShiftFill: '>>>'
        })
    };

    Obj.each(Bitwise.operators.values(), function(bitwiseOperator, methodName) {
        Bitwise[bitwiseOperator] = Bitwise[methodName] = createOperation(bitwiseOperator);
    });

    return Bitwise;
});