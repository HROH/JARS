JAR.module('jar.lang.operations.Bitwise').$import([
    '.::createOperation',
    '..Object!iterate',
    '..Enum'
]).$export(function(createOperation, Obj, Enum) {
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

    Obj.each(Bitwise.operators.values(), defineBitwiseOperation);
    
    function defineBitwiseOperation(bitwiseOperator, methodName) {
        Bitwise[bitwiseOperator] = Bitwise[methodName] = createOperation(bitwiseOperator);
    }

    return Bitwise;
});