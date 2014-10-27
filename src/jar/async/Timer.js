JAR.register({
    MID: 'jar.async.Timer',
    deps: ['System::isFunction', {
        'jar.lang': ['Class', 'Constant::TRUE', 'Object']
    }]
}, function(isFunction, Class, constantTrue, Obj) {
    'use strict';

    var timers = {},
        Timer;
        
    Timer = Class('Timer', {
        $: {
            construct: function(options) {
                options = options || {};

                this._$options = Obj.extend(options || {}, this.Class.DEFAULTS);
                this._$tasks = [];
            },

            schedule: function(task) {
                var timer = this,
                    tasks = timer._$tasks;

                if (isFunction(task)) {
                    tasks.push(task);

                    if (!timer._$requestID && timer._$options.autorun(tasks.length)) {
                        timer.requestRun();
                    }
                }

                return timer;
            },

            requestRun: function() {
                var timer = this,
                    $proxy = timer.$proxy,
                    runTasks = timer._$runTasks;

                if (!timer._$requestID) {
                    timer._$requestID = timer._$request(function requestRun() {
                        $proxy(timer, runTasks, arguments);
                        timer.cancelRun();
                    });
                }

                return timer;
            },

            cancelRun: function() {
                this._$cancel(this._$requestID);

                this._$requestID = null;

                return this;
            },

            isRunning: function() {
                return !!this._$requestID;
            }
        },

        _$: {
            options: null,

            requestID: null,

            tasks: null,

            request: function(runner) {
                return window.setTimeout(runner, this._$options.delay);
            },

            cancel: function(requestID) {
                window.clearTimeout(requestID);
            },

            runTasks: function() {
                var tasks = this._$tasks;

                while (tasks.length) {
                    tasks.shift().apply(null, arguments);
                }
            }
        }
    }, {
        DEFAULTS: {
            delay: 0,

            autorun: constantTrue
        },

        schedule: function(task, delay) {
			var timer;
			
			delay = delay || 0;
			timer = timers[delay] = timers[delay] || new Timer({delay: delay});
			
			timer.schedule(task);
        }
    });

    return Timer;
});