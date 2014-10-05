JAR.register({
    MID: 'jar.async.Number',
    deps: ['.Value', {
        'jar.lang': ['Object!iterate', 'String', 'operations.Arithmetic']
    }]
}, function(Value, Obj, Str, arithmeticOperations) {
    'use strict';

    var ASSIGN = '=',
        asyncNumberProto = {
            construct: function(number) {
                this.$super(Number(number) || 0);
            }
        },
        mapOperators = {
            add: '+',

            subtract: '-',

            multiplyWith: '*',

            divideBy: '/',

            modulo: '%'
        },
        Nr;

    Obj.each(arithmeticOperations, function(arithmeticOperation, methodName) {
        var operator = mapOperators[methodName];

        asyncNumberProto[methodName] = asyncNumberProto[operator] = function(operand) {
            return this.map(arithmeticOperation(operand));
        };

        asyncNumberProto[Str.camelize('self', methodName)] = asyncNumberProto[operator + ASSIGN] = function(operand) {
            return this.update(arithmeticOperation(operand));
        };
    });

    Nr = Value.createSubClass('Number', asyncNumberProto);

    return Nr;
});