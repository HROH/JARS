JAR.register({
    MID: 'jar.lang.operations.Logical',
    deps: '..Object!iterate'
}, function(Obj) {
    'use strict';

    var operations = this,
        Logical = {},
        logicalOperators = {
            and: '&&',

            or: '||'
        };

    Obj.each(logicalOperators, function(logicalOperator, methodName) {
        Logical[methodName] = Logical[logicalOperator] = operations.createOperation(logicalOperator);
        Logical['n' + methodName] = Logical['!' + logicalOperator] = operations.createOperation(logicalOperator, true);
    });

    Logical.xor = function(a, b) {
        var xor;

        if (arguments.length === 2) {
            xor = a ? !b : !! b;
        }
        else {
            b = a;

            xor = function(a) {
                return a ? !b : !! b;
            };
        }

        return xor;
    };

    return Logical;
});