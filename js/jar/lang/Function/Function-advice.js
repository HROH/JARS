JAR.register({
    MID: 'jar.lang.Function.Function-advice',
    deps: '..'
}, function(lang) {
    'use strict';

    var FunctionCopy = this,
        apply = FunctionCopy.apply;

    lang.extendNativeType('Function', {
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
        return FunctionCopy.from(function adviceFn() {
            var context = this,
                result;

            executeBefore && apply(executeBefore, context, arguments);
            result = apply(fn, context, arguments);
            executeAfterwards && apply(executeAfterwards, context, arguments);

            return result;
        }, fn.arity || fn.length);
    }

    return {
        before: FunctionCopy.before,

        after: FunctionCopy.after,

        around: FunctionCopy.around
    };
});