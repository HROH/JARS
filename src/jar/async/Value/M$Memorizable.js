JAR.register({
    MID: 'jar.async.Value.M$Memorizable',
    deps: ['.M$Accumulator', '.M$Skipable', 'jar.lang.MixIn']
}, function(M$Accumulator, M$Skipable, MixIn) {
    'use strict';

    var M$Memorizable = new MixIn('Memorizable', {
        memorizeLast: function(count, fillMemory) {
            var memorizedValue;

            count = count > 0 ? count : 1;

            memorizedValue = this.scan(function(memory, newValue) {
                memory.push(newValue);

                memory.length > count && memory.shift();

                return memory;
            }, []);

            return memorizedValue.skipUntil(function(memory) {
                return !fillMemory || memory.length === count;
            });
        },

        memorizeAll: function() {
            return this.memorizeLast(Infinity);
        }
    }, {
        classes: [this],

        depends: [M$Accumulator, M$Skipable]
    });



    return M$Memorizable;
});