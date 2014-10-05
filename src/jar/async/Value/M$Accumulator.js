JAR.register({
    MID: 'jar.async.Value.M$Accumulator',
    deps: 'jar.lang.MixIn'
}, function(MixIn) {
    'use strict';

    var M$Accumulator = new MixIn('Accumulator', {
        scan: function(scanFn, accumulator) {
            var hasAccumulator = arguments.length > 1;

            return this.map(function scan(newValue) {
                if (!hasAccumulator) {
                    hasAccumulator = true;
                    accumulator = newValue;
                }
                else {
                    accumulator = scanFn(accumulator, newValue);
                }

                return accumulator;
            });
        }
    });

    return M$Accumulator;
});