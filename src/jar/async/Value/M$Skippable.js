JAR.register({
    MID: 'jar.async.Value.M$Skippable',
    deps: ['.M$Acceptable', 'System::isNumber', {
        'jar.lang': [{
            Function: ['!modargs', '::negate']
        }, 'MixIn']
    }]
}, function(M$Acceptable, isNumber, Fn, negate, MixIn) {
    'use strict';

    var M$Skippable = new MixIn('Skippable', {
        skip: function(n) {
            isNumber(n) || (n = 0);

            return this.skipUntil(Fn.partial(skipUntilZero, {
                n: n
            }));
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
        classes: [this],

        depends: [M$Acceptable]
    });

    function skipUntilZero(n) {
        return n.n-- === 0;
    }

    return M$Skippable;
});