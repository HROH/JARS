JARS.internal('States/Updater', function(getInternal) {
    'use strict';

    var StateInfo = getInternal('States/Info'),
        merge = getInternal('Helpers/Object').merge,
        MSG_ATTEMPT = 'attempted to mark as ${nextState} but is currently ${curState}',
        MSG_DONE = 'is ${nextState}',
        LOG_ATTEMPT = 'attempt',
        LOG_DONE = 'done';

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
                logInfo = merge(merge({
                    curState: currentStateInfo.text,
    
                    nextState: nextStateInfo.text
                }, nextStateInfo.methods), logInfo);
    
                updater._logger[logInfo[canTransition ? LOG_DONE : LOG_ATTEMPT]](getMessage(canTransition, message), logInfo);
            });
        }
    };

    /**
     * @memberof JARS~internals.States.Updater
     * @inner
     *
     * @param {boolean} canTransition
     * @param {string} message
     *
     * @return {string}
     */
    function getMessage(canTransition, message) {
        return (canTransition ? MSG_DONE : MSG_ATTEMPT) + (message ? ' - ' + message : '');
    }

    StateInfo.each(function(stateInfo) {
        Updater.prototype[stateInfo.set] = function(customMessage, logInfo) {
            return this._update(stateInfo, customMessage, logInfo);
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
