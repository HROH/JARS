JARS.internal('States/Updater', function(getInternal) {
    'use strict';

    var StateInfo = getInternal('States/Info'),
        LogData = getInternal('States/LogData'),
        merge = getInternal('Helpers/Object').merge;

    /**
     * @class
     *
     * @memberof JARS~internals.States
     *
     * @param {JARS~internals.States.Subject} state
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
         * @param {JARS~internals.States.Info} stateInfo
         * @param {string} [message]
         * @param {Object} [logInfo]
         *
         * @return {boolean}
         */
        _update: function(stateInfo, message, logInfo) {
            var updater = this;

            return updater._state.set(stateInfo, function(canTransition, currentStateInfo, nextStateInfo) {
                updater._logger[LogData.getMethod(nextStateInfo, canTransition)](LogData.getMessage(message, canTransition), merge({
                    curState: currentStateInfo.text,

                    nextState: nextStateInfo.text
                }, logInfo));
            });
        }
    };

    StateInfo.each(function(stateInfo) {
        Updater.prototype[stateInfo.set] = function(message, logInfo) {
            return this._update(stateInfo, message, logInfo);
        };
    });

    /**
     * @method JARS~internals.States.Updater#setWaiting
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Updater#setLoading
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Updater#setRegistered
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Updater#setIntercepted
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Updater#setLoaded
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    /**
     * @method JARS~internals.States.Updater#setAborted
     *
     * @param {string} [message]
     * @param {Object} [logInfo]
     *
     * @return {boolean}
     */

    return Updater;
});
