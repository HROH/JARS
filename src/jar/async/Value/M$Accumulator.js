JAR.register({
    MID: 'jar.async.Value.M$Accumulator',
    deps: ['.M$Mappable', 'jar.lang.MixIn']
}, function(M$Mappable, MixIn) {
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
    }, {
        classes: [this],
        
        depends: [M$Mappable]
    });

    return M$Accumulator;
});