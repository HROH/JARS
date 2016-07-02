JAR.module('jar.async.Value.M$FlowRegulator').$import([
    '.M$Forwardable',
    {
        'jar.lang': [
            'Function!flow',
            'Mixin'
        ]
    }
]).$export(function(M$Forwardable, Fn, Mixin) {
    'use strict';

    var M$FlowRegulator = new Mixin('FlowRegulator', {
        throttle: function(ms, options) {
            return this.forward({
                update: Fn.throttle(regulatedUpdate, ms, options)
            });
        },

        debounce: function(ms, immediate) {
            return this.forward({
                update: Fn.debounce(regulatedUpdate, ms, immediate)
            });
        },

        delay: function(ms) {
            return this.forward({
                update: Fn.delay(regulatedUpdate, ms)
            });
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    function regulatedUpdate(forwardedValue, newValue) {
        forwardedValue.assign(newValue);
    }

    return M$FlowRegulator;
});