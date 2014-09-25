JAR.register({
    MID: 'jar.lang.operations.Logical',
    deps: '..Object!iterate'
}, function(Obj) {
    'use strict';

    var operations = this,
        Logical = {},
        logicalOperators = {
            and: {
                op: '&&',
                negated: 'xor'
            },

            or: {
                op: '||',
                negated: 'nor'
            }
        };

    Obj.each(logicalOperators, function(logicalOperator, methodName) {
		Logical[methodName] = Logical[logicalOperator.op] = operations.createOperator(logicalOperator.op);
		Logical[logicalOperator.negated] = Logical['!' + logicalOperator.op] = operations.createOperator(logicalOperator.op, true);
    });

    return Logical;
});