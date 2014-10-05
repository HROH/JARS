JAR.register({
    MID: 'jar.async.Value.M$Skipable',
    deps: ['System::isNumber', {
        'jar.lang': ['Function::negate', 'MixIn']
    }]
}, function(isNumber, negate, MixIn) {
    'use strict';

    var M$Skipable = new MixIn('Skipable', {
        skip: function(n) {
            isNumber(n) || (n = 0);

            return this.skipUntil(function skipUntil() {
                return n-- === 0;
            });
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

    return M$Skipable;
});