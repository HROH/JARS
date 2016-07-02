JAR.module('jar.async.Value.M$Accumulator').$import([
    '.M$Mappable',
    'jar.lang.Mixin'
]).$export(function(M$Mappable, Mixin) {
    'use strict';

    var M$Accumulator = new Mixin('Accumulator', {
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