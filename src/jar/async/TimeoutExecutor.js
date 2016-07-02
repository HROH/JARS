JAR.module('jar.async.TimeoutExecutor').$import([
    'System::env',
    'jar.lang.Class',
    '.I$Executor'
]).$export(function(env, Class, I$Executor) {
    'use strict';

    var global = env.global,
        TimeoutExecutor;

    TimeoutExecutor = Class('TimeoutExecutor', {
        construct: function(delay) {
            this.setDelay(delay);
        },

        cancel: function(id) {
            return global.clearTimeout(id);
        },

        $: {
            request: function(runner) {
                return global.setTimeout(runner, this._$delay);
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