JAR.module('jar.lang.Function.Function-guards').$import([
    {
        '.': [
            '::from',
            '::apply'
        ]
    },
    '..Object!derive'
]).$export(function(fromFunction, applyFunction, Obj) {
    'use strict';

    var Fn = this;

    Fn.enhance({
        memoize: function(serializer) {
            var fn = this,
                cache = {};

            return fromFunction(function memoizedFn() {
                var hash = (serializer || internalSerializer)(arguments);

                return hash in cache ? cache[hash] : (cache[hash] = applyFunction(fn, this, arguments));
            });
        },

        once: function() {
            return Fn.callN(this, 1);
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
                result = applyFunction(fn, this, arguments);
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

    return Obj.extract(Fn, ['memoize', 'once', 'callN', 'blockN']);
});