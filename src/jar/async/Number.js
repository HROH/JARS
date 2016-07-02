JAR.module('jar.async.Number').$import([
    'System::isSet',
    '.Value',
    {
        'jar.lang': [
            'Object!reduce',
            'String',
            {
                'operations.Arithmetic': [
                    '.',
                    '::operators'
                ]
            }
        ]
    }
]).$export(function(isSet, Value, Obj, Str, arithmeticOperations, arithmeticOperators) {
    'use strict';

    var Nr = Value.createSubClass('Number', Obj.reduce(arithmeticOperators.values(), function(asyncNumberProto, arithmeticOperator, arithmeticOperationName) {
        var arithmeticOperation = arithmeticOperations[arithmeticOperationName];

        asyncNumberProto[arithmeticOperationName] = asyncNumberProto[arithmeticOperator] = function(operand) {
            return this.map(arithmeticOperation(operand));
        };

        asyncNumberProto[Str.camelize('self', arithmeticOperationName)] = asyncNumberProto[arithmeticOperator + '='] = function(operand) {
            return this.update(arithmeticOperation(operand));
        };

        if (arithmeticOperator === arithmeticOperators.add || arithmeticOperator === arithmeticOperators.subtract) {
            asyncNumberProto[Str.camelize('self', arithmeticOperationName + 'One')] = asyncNumberProto[arithmeticOperator + arithmeticOperator] = function() {
                return this[arithmeticOperator + '='](1);
            };
        }
    }, {
        construct: function(number) {
            this.$super(isSet(number) ? Number(number) || 0 : null);
        }
    }));

    return Nr;
});