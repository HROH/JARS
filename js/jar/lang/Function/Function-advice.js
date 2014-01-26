JAR.register({
    MID: 'jar.lang.Function.Function-advice',
    deps: '..'
}, function(lang) {
    'use strict';

    var FunctionCopy = this,
        apply = FunctionCopy.apply;

    lang.extendNativeType('Function', {
        after: function(beforeFn) {
            return createAdvice(this, beforeFn);
        },

        before: function(afterFn) {
            return createAdvice(this, null, afterFn);
        },

        around: function(beforeFn, afterFn) {
            return createAdvice(this, beforeFn, afterFn);
        }
    });

    function createAdvice(fn, beforeFn, afterFn) {
        return FunctionCopy.from(function adviceFn() {
            var context = this,
                result;

            beforeFn && apply(beforeFn, context, arguments);
            result = apply(fn, context, arguments);
            afterFn && apply(afterFn, context, arguments);

            return result;
        }, fn.arity || fn.length);
    }

    return {
        before: FunctionCopy.before,

        after: FunctionCopy.after,

        around: FunctionCopy.around
    };
});