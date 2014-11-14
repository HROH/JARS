JAR.register({
    MID: 'jar.lang.operations.Bitwise',
    deps: ['.::createOperation', '..Object!iterate']
}, function(createOperation, Obj) {
    'use strict';

    var Bitwise = {},
        bitwiseOperators = {
            and: '&',

            or: '|',

            xor: '^',

            leftShift: '<<',

            rightShiftDrop: '>>',

            rightShiftFill: '>>>'
        };

    Obj.each(bitwiseOperators, function(bitwiseOperator, methodName) {
		Bitwise[bitwiseOperator] = Bitwise[methodName] = createOperation(bitwiseOperator);
    });

    return Bitwise;
});