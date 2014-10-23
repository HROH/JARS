JAR.register({
    MID: 'jar.async.TaskRunner',
    deps: ['System::isFunction', {
        'jar.lang': ['Class', 'Constant::TRUE', 'Object']
    }]
}, function(isFunction, Class, constantTrue, Obj) {
    'use strict';

    var async = this,
        TaskRunner;

    TaskRunner = Class('TaskRunner', {
        $: {
            construct: function(options) {
                options = options || {};

                this._$options = Obj.extend(options || {}, this.Class.DEFAULTS);
                this._$tasks = [];
            },

            schedule: function(task) {
                var tasks = this._$tasks;

                if (isFunction(task)) {
                    tasks.push(task);

                    if (!this._$running && this._$options.autorun(tasks.length)) {
                        this.run();
                    }
                }
            },

            run: function() {
                var taskRunner = this,
                    options = taskRunner._$options,
                    $proxy = taskRunner.$proxy;

                if (!taskRunner._$running) {
                    taskRunner._$running = true;

                    options.immediate ? taskRunner._$runTasks() : async.wait($proxy, options.delay, taskRunner, taskRunner._$runTasks);
                }
            },

            isRunning: function() {
                return this._$running;
            }
        },

        _$: {
            immediate: false,

            delay: 0,

            running: false,

            autorun: null,

            tasks: null,

            runTasks: function() {
                var tasks = this._$tasks;

                while (tasks.length) {
                    tasks.shift()();
                }

                this._$running = false;
            }
        }
    }, {
        DEFAULTS: {
            immediate: false,
            delay: 0,
            autorun: constantTrue
        }
    });

    return TaskRunner;
});