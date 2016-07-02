JAR.module('jar.async.Value.M$Takeable').$import([
    '.M$Forwardable',
    {
        'jar.lang': [
            {
                Function: [
                    '!modargs',
                    '::negate'
                ]
            },
            'Mixin'
        ]
    }
]).$export(function(M$Forwardable, Fn, negate, Mixin) {
    'use strict';

    var M$Takeable = new Mixin('Takeable', {
        take: function(n) {
            var takenValue;

            if (n > 0) {
                takenValue = this.takeUntil(Fn.partial(takeUntilZero, {
                    n: n
                }));
            }
            else {
                takenValue = new this.Class();

                takenValue.error(new Error('Can\'t take 0 or less values'));
                takenValue.freeze();
            }

            return takenValue;
        },

        takeUntil: function(untilFn) {
            return this.forward({
                update: function(forwardedValue, newValue) {
                    if (untilFn(newValue)) {
                        forwardedValue.freeze();
                    }
                    else {
                        forwardedValue.assign(newValue);
                    }
                }
            });
        },

        takeWhile: function(whileFn) {
            return this.takeUntil(negate(whileFn));
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    function takeUntilZero(n) {
        return n.n-- === 0;
    }

    return M$Takeable;
});