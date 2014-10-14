JAR.register({
    MID: 'jar.async.Value.M$FlowRegulator',
    deps: 'jar.lang.MixIn'
}, function(MixIn) {
    'use strict';

    var M$FlowRegulator = new MixIn('FlowRegulator', {
        throttle: function(ms) {
            return this.accept(createFlowRegulator(ms));
        },

        debounce: function(ms) {
            return this.accept(createFlowRegulator(ms, true));
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
        classes: [this]
    });

    function createFlowRegulator(msClosed, resetOnCall) {
        var timeoutID;

        function open() {
            timeoutID = false;
        }

        function close() {
            if (timeoutID) {
                window.clearTimeout(timeoutID);
            }

            timeoutID = window.setTimeout(open, msClosed);
        }

        function regulateFlow() {
            var accept = !timeoutID;

            if (resetOnCall || accept) {
                close();
            }

            return accept;
        }

        return regulateFlow;
    }

    return M$FlowRegulator;
});