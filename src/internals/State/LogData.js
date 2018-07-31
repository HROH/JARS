JARS.internal('State/LogData', function(getInternal) {
    'use strict';

    var States = getInternal('State/States'),
        Levels = getInternal('Logger/Levels'),
        LOG_ATTEMPT = 0,
        LOG_DONE = 1,
        LOG_METHODS = [{
            message: 'attempted to mark as ${s1} but is currently ${s0}'
        }, {
            message: 'is ${s1}'
        }],
        LogData;

    States.each(function(state) {
        LOG_METHODS[LOG_ATTEMPT][state] = Levels.getLevel(state === States.LOADING || state === States.LOADED ? Levels.DEBUG : Levels.WARN);
        LOG_METHODS[LOG_DONE][state] = Levels.getLevel(state === States.ABORTED ? Levels.ERROR : Levels.INFO);
    });

    /**
     * @namespace
     *
     * @memberof JARS~internals.State
     */
    LogData = {
        /**
         * @param {string} currentState
         * @param {string} nextState
         *
         * @return {Object}
         */
        getInfo: function(currentState, nextState) {
            return {
                s0: currentState,

                s1: nextState
            };
        },
        /**
         * @param {boolean} canTransition
         * @param {string} state
         *
         * @return {string}
         */
        getMethod: function(canTransition, state) {
            return LOG_METHODS[canTransition ? LOG_DONE : LOG_ATTEMPT][state];
        },
        /**
         * @param {boolean} canTransition
         * @param {string} message
         *
         * @return {string}
         */
        getMessage: function(canTransition, message) {
            return LOG_METHODS[canTransition ? LOG_DONE : LOG_ATTEMPT].message + (message ? ' - ' + message : '');
        }
    };

    return LogData;
});
