JAR.register({
    MID: 'jar.lang.Function.Function-advice',
    deps: ['.::apply', '..Object!derive']
}, function(applyFunction, Obj) {
    'use strict';

    var Fn = this;

    Fn.enhance({
        after: function(executeAfterwards) {
            return createAdvice(this, null, executeAfterwards);
        },

        before: function(executeBefore) {
            return createAdvice(this, executeBefore);
        },

        around: function(executeBefore, executeAfterwards) {
            return createAdvice(this, executeBefore, executeAfterwards);
        }
    });

    function createAdvice(fn, executeBefore, executeAfterwards) {
        return Fn.from(function adviceFn() {
            var context = this,
                result;

            executeBefore && applyFunction(executeBefore, context, arguments);
            result = applyFunction(fn, context, arguments);
            executeAfterwards && applyFunction(executeAfterwards, context, arguments);

            return result;
        }, fn.arity || fn.length);
    }

    return Obj.extract(Fn, ['before', 'after', 'around']);
});