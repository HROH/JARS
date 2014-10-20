JAR.register({
    MID: 'jar.async.Value.M$Skipable',
    deps: ['System::isNumber', {
        'jar.lang': [{
            Function: ['!modargs', '::negate']
        }, 'MixIn']
    }]
}, function(isNumber, Fn, negate, MixIn) {
    'use strict';

    var M$Skipable = new MixIn('Skipable', {
        skip: function(n) {
            isNumber(n) || (n = 0);

            return this.skipUntil(Fn.partial(skipUntilZero, n));
        },

        skipUntil: function(untilFn) {
            var noSkip = false;

            return this.accept(function(newValue) {
                noSkip || (noSkip = untilFn(newValue));

                return noSkip;
            });
        },

        skipWhile: function(whileFn) {
            return this.skipUntil(negate(whileFn));
        }
    }, {
        classes: [this]
    });

    function skipUntilZero(n) {
        return n-- === 0;
    }

    return M$Skipable;
});