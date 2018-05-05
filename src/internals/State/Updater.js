JARS.internal('State/Updater', function(getInternal) {
    'use strict';

    var LogData = getInternal('State/LogData'),
        merge = getInternal('Helpers/Object').merge;

    /**
     * @class
     *
     * @memberof JARS~internals.State
     *
     * @param {JARS~internals.State.Subject} state
     * @param {JARS~internals.Helpers.Logger} logger
     */
    function Updater(state, logger) {
        this._state = state;
        this._logger = logger;
    }

    Updater.prototype = {
        constructor: Updater,
        /**
         * @private
         *
         * @param {string} state
         * @param {string} [message]
         * @param {Object} [logInfo]
         *
         * @return {boolean}
         */
        update: function(state, message, logInfo) {
            var updater = this;

            return updater._state.set(state, function(canTransition, currentState, nextState) {
                updater._logger[LogData.getMethod(canTransition, nextState)](LogData.getMessage(canTransition, message), merge(LogData.getInfo(currentState, nextState), logInfo));
            });
        }
    };

    return Updater;
});
