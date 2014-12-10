JAR.register({
    MID: 'jar.async.TimeoutExecutor',
    deps: ['jar.lang.Class', '.I$Executor']
}, function(Class, I$Executor) {
    'use strict';

    var TimeoutExecutor = Class('TimeoutExecutor', {
        construct: function(delay) {
            this.setDelay(delay);
        },

        cancel: function(id) {
            return window.clearTimeout(id);
        },

        $: {
            request: function(runner) {
                return window.setTimeout(runner, this._$delay);
            },

            setDelay: function(delay) {
                this._$delay = delay || 0;

                return this;
            }
        },

        _$: {
            delay: 0
        }
    }).implementz(I$Executor);

    return TimeoutExecutor;
});