JAR.register({
    MID: 'jar.async.Value.M$FlowRegulator',
    deps: ['.M$Forwardable', {
        'jar.lang': [{
            Function: ['::bind', '!guards']
        }, 'MixIn']
    }]
}, function(M$Forwardable, bind, Fn, MixIn) {
    'use strict';

    var M$FlowRegulator = new MixIn('FlowRegulator', {
        throttle: function(ms, options) {
            var throttledValue = new this.Class();

            return this.forwardTo(throttledValue, {
                onUpdate: Fn.throttle(bind(throttledValue.assign, throttledValue), ms, options)
            });
        },

        debounce: function(ms, immediate) {
            var debouncedValue = new this.Class();

            return this.forwardTo(debouncedValue, {
                onUpdate: Fn.debounce(bind(debouncedValue.assign, debouncedValue), ms, immediate)
            });
        },

        delay: function(ms) {
            var value = this,
                delayedValue = new value.Class();

            value.forwardTo(delayedValue, {
                onUpdate: function(newValue) {
                    window.setTimeout(function() {
                        delayedValue.assign(newValue);
                    }, ms);
                }
            });

            return delayedValue;
        }
    }, {
        classes: [this],
        
        depends: [M$Forwardable]
    });

    return M$FlowRegulator;
});