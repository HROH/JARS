JAR.register({
    MID: 'jar.async.Value.M$Takeable',
    deps: {
        'jar.lang': ['Class', {
            Function: ['!modargs', '::negate']
        }, 'MixIn']
    }
}, function(Class, Fn, negate, MixIn) {
    'use strict';

    var $proxy = Class.createProxy(),
        M$Takeable;

    M$Takeable = new MixIn('Takeable', {
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
            return $proxy(this, proxiedTakeUntil, [untilFn]);
        },

        takeWhile: function(whileFn) {
            return this.takeUntil(negate(whileFn));
        }
    }, {
        classes: [this]
    });

    function proxiedTakeUntil(untilFn) {
        /*jslint validthis: true */
        return this._$chainValue({
            guardComplete: untilFn
        });
    }

    function takeUntilZero(n) {
        return --n === 0;
    }

    return M$Takeable;
});