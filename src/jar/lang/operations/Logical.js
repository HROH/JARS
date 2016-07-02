JAR.module('jar.lang.operations.Logical').$import([
    '.::createOperation',
    '.::operands',
    '..Object!iterate',
    '..Enum'
]).$export(function(createOperation, operands, Obj, Enum) {
    'use strict';

    var Logical = {
        operators: new Enum({
            and: '&&',

            or: '||',

            xor: '?!' + operands.SECOND + ':!!'
        })
    };

    Obj.each(Logical.operators.values(), defineLogicalOperation);
    
    function defineLogicalOperation(logicalOperator, methodName) {
        Logical[methodName] = Logical[logicalOperator] = createOperation(logicalOperator);
        Logical['n' + methodName] = Logical['!' + logicalOperator] = createOperation(logicalOperator, true);
    }

    return Logical;
});