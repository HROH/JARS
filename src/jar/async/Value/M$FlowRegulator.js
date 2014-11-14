JAR.register({
    MID: 'jar.async.Value.M$FlowRegulator',
    deps: ['.M$Forwardable', {
        'jar.lang': [{
            Function: ['::bind', '!flow']
        }, 'MixIn']
    }]
}, function(M$Forwardable, bind, Fn, MixIn) {
    'use strict';

    var M$FlowRegulator = new MixIn('FlowRegulator', {
        throttle: function(ms, options) {
            var throttledValue = new this.Class();

            return this.forwardTo(throttledValue, {
                onUpdate: Fn.throttle(bindAssign(throttledValue), ms, options)
            });
        },

        debounce: function(ms, immediate) {
            var debouncedValue = new this.Class();

            return this.forwardTo(debouncedValue, {
                onUpdate: Fn.debounce(bindAssign(debouncedValue), ms, immediate)
            });
        },

        delay: function(ms) {
            var delayedValue = new this.Class();

            this.forwardTo(delayedValue, {
                onUpdate: Fn.delay(bindAssign(delayedValue), ms)
            });

            return delayedValue;
        }
    }, {
        classes: [this],

        depends: [M$Forwardable]
    });

    function bindAssign(value) {
        return bind(value.assign, value);
    }

    return M$FlowRegulator;
});