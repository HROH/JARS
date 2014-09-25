JAR.register({
    MID: 'jar.lang.operations.Bitwise',
    deps: '..Object!iterate'
}, function(Obj) {
    'use strict';

    var operations = this,
        Bitwise = {},
        bitwiseOperators = {
            and: '&',

            or: '|',

            xor: '^',

            leftShift: '<<',

            rightShiftDrop: '>>',

            rightShiftFill: '>>>'
        };

    Obj.each(bitwiseOperators, function(bitwiseOperator, methodName) {
		Bitwise[bitwiseOperator] = Bitwise[methodName] = operations.createOperation(bitwiseOperator);
    });

    return Bitwise;
});