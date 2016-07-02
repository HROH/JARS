JAR.module('jar.async.ImmediateExecutor').$import([{
    System: ['::env', '::isString'],
    '..lang.Function': ['::attempt', '!modargs']
}, '.I$Executor']).$export(function(env, isString, attempt, Fn, I$Executor) {
    'use strict';

    var global = env.global,
        nextHandle = 1,
        tasksByHandle = {},
        currentlyRunningATask = false,
        doc = global.document,
        partial = Fn.partial,
        NO_PREFERENCE_ORIGIN = '*',
        SCRIPT_TAG = 'script',
        setImmediateImplementation,
        ImmediateExecutor;

    function registerTask(task) {
        tasksByHandle[nextHandle] = task;

        return nextHandle++;
    }

    function runIfPresent(handle) {
        var task;

        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            global.setTimeout(partial(runIfPresent, handle), 0);
        }
        else {
            task = tasksByHandle[handle];

            if (task) {
                currentlyRunningATask = true;

                attempt(task);

                ImmediateExecutor.cancel(handle);
                currentlyRunningATask = false;
            }
        }
    }

    function installNextTickImplementation() {
        return function(task) {
            var handle = registerTask(task);

            process.nextTick(partial(runIfPresent, handle));

            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true,
                oldOnMessage = global.onmessage;

            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage('', NO_PREFERENCE_ORIGIN);
            global.onmessage = oldOnMessage;

            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
        var isNewerBrowser = !('attachEvent' in doc),
            MESSAGE_PREFIX = 'setImmediate$' + Math.random() + '$',
            ADD_LISTENER_METHOD = isNewerBrowser ? 'addEventListener' : 'attachEvent',
            MESSAGE_EVENT = (isNewerBrowser ? '' : 'on') + 'message';

        global[ADD_LISTENER_METHOD](MESSAGE_EVENT, function(event) {
            if (event.source === global && isString(event.data) && event.data.indexOf(MESSAGE_PREFIX) === 0) {
                runIfPresent(+event.data.slice(MESSAGE_PREFIX.length));
            }
        }, false);

        return function(task) {
            var handle = registerTask(task);

            global.postMessage(MESSAGE_PREFIX + handle, NO_PREFERENCE_ORIGIN);

            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        
        channel.port1.onmessage = function(event) {
            runIfPresent(event.data);
        };

        return function(task) {
            var handle = registerTask(task);
            
            channel.port2.postMessage(handle);
            
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;

        return function(task) {
            var handle = registerTask(task),
                // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                script = doc.createElement(SCRIPT_TAG);

            script.onreadystatechange = function() {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);

            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        return function(task) {
            var handle = registerTask(task);

            setTimeout(partial(runIfPresent, handle), 0);

            return handle;
        };
    }


    if (global.setImmediate) {
        ImmediateExecutor = {
            request: function(runner) {
                return global.setImmediate(runner);
            },

            cancel: function(id) {
                return global.clearImmediate(id);
            }
        };
    }
    else {
        // Don't get fooled by e.g. browserify environments.
        if ({}.toString.call(global.process) === '[object process]') {
            // For Node.js before 0.9
            setImmediateImplementation = installNextTickImplementation();
        }
        else if (canUsePostMessage()) {
            // For non-IE10 modern browsers
            setImmediateImplementation = installPostMessageImplementation();
        }
        else if (global.MessageChannel) {
            // For web workers, where supported
            setImmediateImplementation = installMessageChannelImplementation();
        }
        else if (doc && 'onreadystatechange' in doc.createElement(SCRIPT_TAG)) {
            // For IE 6–8
            setImmediateImplementation = installReadyStateChangeImplementation();
        }
        else {
            // For older browsers
            setImmediateImplementation = installSetTimeoutImplementation();
        }

        ImmediateExecutor = {
            request: setImmediateImplementation,

            cancel: function clearImmediate(handle) {
                delete tasksByHandle[handle];
            }
        };
    }

    I$Executor.isImplementedBy(ImmediateExecutor, true);

    return ImmediateExecutor;
});