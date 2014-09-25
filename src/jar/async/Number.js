JAR.register({
    MID: 'jar.async.Number',
    deps: ['.Value', {
        'jar.lang': ['Object!iterate']
    }]
}, function(Value, Obj) {
    'use strict';

    var ASSIGN = '=',
        PLUS = '+',
        MINUS = '-',
        MULTIPLY = '*',
        DIVIDE = '/',
        asyncNumberProto = {
            construct: function(number) {
                this.$super(number || 0);
            }
        },
        mapOperators = {
            add: PLUS,

            subtract: MINUS,

            multiplyWith: MULTIPLY,

            divideBy: DIVIDE
        },
        Number;

    Obj.each(mapOperators, function(operator, methodName) {
        /*jslint evil: true */
        var operation = new Function('a,b', 'return a' + operator + 'b');

        asyncNumberProto[methodName] = asyncNumberProto[operator] = function(operand) {
            return this.map(function(value) {
                return operation(value, operand);
            });
        };

        asyncNumberProto[operator + ASSIGN] = function(operand) {
            return this.assign(function(value) {
                return operation(value, operand);
            });
        };
    });

    Number = Value.createSubClass('Number', asyncNumberProto);

    return Number;
});