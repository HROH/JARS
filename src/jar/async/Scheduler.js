JAR.module('jar.async.Scheduler').$import([
    {
        System: [
            '::isFunction',
            '::isNumber'
        ],
        'jar.lang': [
            'Class',
            'Constant::TRUE',
            'Object'
        ]
    },
    '.TimeoutExecutor',
    '.I$Executor'
]).$export(function(isFunction, isNumber, Class, constantTrue, Obj, TimeoutExecutor, I$Executor) {
    'use strict';

    var Scheduler = Class('Scheduler', {
        $: {
            construct: function(options) {
                this._$tasks = [];
                this._$options = options = Obj.extend(options || {}, this.Class.DEFAULTS);

                if (!I$Executor.isImplementedBy(options.executor, true)) {
                    options.executor = this.Class.DEFAULTS.executor;
                }
            },

            schedule: function(task) {
                var scheduler = this,
                    tasks = scheduler._$tasks;

                if (isFunction(task)) {
                    tasks.push(task);

                    if (!scheduler._$requestID && scheduler._$options.autorun(tasks.length)) {
                        scheduler.requestRun();
                    }
                }

                return scheduler;
            },

            requestRun: function() {
                var scheduler = this,
                    $proxy = scheduler.$proxy,
                    runTasks = scheduler._$runTasks;

                if (!scheduler._$requestID) {
                    scheduler._$requestID = scheduler._$options.executor.request(function requestRun() {
                        scheduler.cancelRun();
                        $proxy(scheduler, runTasks);
                    });
                }

                return scheduler;
            },

            cancelRun: function() {
                this._$options.executor.cancel(this._$requestID);

                this._$requestID = null;

                return this;
            },

            isScheduled: function() {
                return isNumber(this._$requestID);
            }
        },

        _$: {
            options: null,

            requestID: null,

            tasks: null,

            runTasks: function() {
                var tasks = this._$tasks;

                while (tasks.length) {
                    tasks.shift()();
                }
            }
        }
    }, {
        DEFAULTS: {
            autorun: constantTrue,

            executor: new TimeoutExecutor(0)
        }
    });

    return Scheduler;
});