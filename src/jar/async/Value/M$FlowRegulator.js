JAR.module('jar.async.Value.M$FlowRegulator').$import([
    '.M$Forwardable',
    {
        'jar.lang': [
            'Function!flow',
            'MixIn'
        ]
    }
]).$export(function(M$Forwardable, Fn, MixIn) {
    'use strict';

    var M$FlowRegulator = new MixIn('FlowRegulator', {
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