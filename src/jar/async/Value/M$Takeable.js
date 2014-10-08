JAR.register({
    MID: 'jar.async.Value.M$Takeable',
    deps: {
        'jar.lang': [{
            Function: ['!modargs', '::negate']
        }, 'MixIn']
    }
}, function(Fn, negate, MixIn) {
    'use strict';

    var M$Takeable = new MixIn('Takeable', {
        take: function(n) {
            var takenValue;

            if (n > 0) {
                takenValue = this.takeUntil(Fn.partial(takeUntilZero, n));
            }
            else {
                takenValue = new this.Class();

                takenValue.error(new Error('Can\'t take 0 values'));
                takenValue.freeze();
            }

            return takenValue;
        },

        takeUntil: function(untilFn) {
            return this.chainValue({
                guardFreeze: untilFn
            });
        },

        takeWhile: function(whileFn) {
            return this.takeUntil(negate(whileFn));
        }
    }, {
        classes: [this]
    });

    function takeUntilZero(n) {
        return --n === 0;
    }

    return M$Takeable;
});