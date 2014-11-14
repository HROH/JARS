JAR.register({
    MID: 'jar.lang.Function.Function-guards',
    deps: ['..', '..Object!derive']
}, function(lang, Obj) {
    'use strict';

    var FunctionCopy = this,
        fromFunction = FunctionCopy.from,
        apply = FunctionCopy.apply;

    lang.extendNativeType('Function', {
        memoize: function(serializer) {
            var fn = this,
                cache = {};

            return fromFunction(function memoizedFn() {
                var hash = (serializer || internalSerializer)(arguments);

                return hash in cache ? cache[hash] : (cache[hash] = apply(fn, this, arguments));
            });
        },

        once: function() {
            return FunctionCopy.callN(this, 1);
        },

        callN: function(count) {
            return createGuardedFunction(this, count, false);
        },

        blockN: function(count) {
            return createGuardedFunction(this, count, true);
        }
    });

    function createGuardedFunction(fn, count, guardBefore) {
        var called = 0;

        count = Math.round(Math.abs(count)) || 0;

        return fromFunction(function guardedFn() {
            var unguarded = guardBefore ? called >= count : called < count,
                result;

            if (unguarded) {
                result = apply(fn, this, arguments);
            }

            if (unguarded !== guardBefore) {
                called++;
            }

            return result;
        });
    }

    /**
     * TODO better implementation
     * 
     * @param {Arguments} args
     * 
     * @return {String}
     */
    function internalSerializer(args) {
        return JSON.stringify(args[0]);
    }

    return Obj.extract(FunctionCopy, ['memoize', 'once', 'callN', 'blockN']);
});