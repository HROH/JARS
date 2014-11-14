JAR.register({
    MID: 'jar.lang.operations.Logical',
    deps: ['.::createOperation', '..Object!iterate']
}, function(createOperation, Obj) {
    'use strict';

    var Logical = {},
        logicalOperators = {
            and: '&&',

            or: '||'
        };

    Obj.each(logicalOperators, function(logicalOperator, methodName) {
        Logical[methodName] = Logical[logicalOperator] = createOperation(logicalOperator);
        Logical['n' + methodName] = Logical['!' + logicalOperator] = createOperation(logicalOperator, true);
    });
    
    Logical.xor = createOperation('?!b:!!');

    return Logical;
});