JARS.internal('States/LogData', function() {
    'use strict';

    var LOG_ATTEMPT = 'attempt',
        LOG_DONE = 'done',
        MSG_ATTEMPT = 'attempted to mark as ${nextState} but is currently ${curState}',
        MSG_DONE = 'is ${nextState}',
        LOG_METHODS = {},
        LogData;

    LOG_METHODS.registered = LOG_METHODS.waiting = LOG_METHODS.intercepted = {
        attempt: 'warn',

        done: 'info'
    };

    LOG_METHODS.loaded = LOG_METHODS.loading = {
        attempt: 'debug',

        done: LOG_METHODS.waiting.done
    };

    LOG_METHODS.aborted = {
        attempt: LOG_METHODS.waiting.attempt,

        done: 'error'
    };

    /**
     * @namespace
     *
     * @memberof JARS~internals.States
     */
    LogData = {
        /**
         * @param {JARS~internals.States.Info} stateInfo
         * @param {boolean} canTransition
         *
         * @return {string}
         */
        getMethod: function(stateInfo, canTransition) {
            return LOG_METHODS[stateInfo.text][canTransition ? LOG_DONE : LOG_ATTEMPT];
        },
        /**
         * @param {string} message
         * @param {boolean} canTransition
         *
         * @return {string}
         */
        getMessage: function(message, canTransition) {
            return (canTransition ? MSG_DONE : MSG_ATTEMPT) + (message ? ' - ' + message : '');
        }
    };

    return LogData;
});
