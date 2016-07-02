JAR.module('jar.async.Value.M$Skippable').$import([
    '.M$Acceptable',
    'System::isNumber',
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
]).$export(function(M$Acceptable, isNumber, Fn, negate, Mixin) {
    'use strict';

    var M$Skippable = new Mixin('Skippable', {
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