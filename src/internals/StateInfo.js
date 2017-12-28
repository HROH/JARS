JARS.internal('StateInfo', function stateInfoSetup(getInternal) {
    'use strict';

    var arrayEach = getInternal('Utils').arrayEach,
        IS_PREFIX = 'is',
        SET_PREFIX = 'set',
        LOG_METHODS = {},
        stateInfos = [];

    LOG_METHODS.registered = LOG_METHODS.waiting = {
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
     * @class
     *
     * @memberof JARS.internals
     *
     * @param {string} stateText
     * @param {Object} logMethods
     */
    function StateInfo(stateText, stateMethodText, logMethods) {
        this.text = stateText;
        this.methods = logMethods;
        this.is = IS_PREFIX + stateMethodText;
        this.set = SET_PREFIX + stateMethodText;
    }

    /**
     * @return {JARS.internals.StateInfo}
     */
    StateInfo.initial = function() {
        return stateInfos[0];
    };

    /**
     * @param {function(JARS.internals.StateInfo)} callback
     */
    StateInfo.each = function(callback) {
        arrayEach(stateInfos, callback);
    };

    StateInfo.prototype = {
        constructor: StateInfo,
        /**
         * @param {JARS.internals.StateInfo} nextStateInfo
         *
         * @return {boolean}
         */
        hasNext: function(nextStateInfo) {
            return this._next.indexOf(nextStateInfo) > -1;
        },
        /**
         * @param {JARS.internals.StateInfo[]} nextStateInfos
         */
        setNext: function(nextStateInfos) {
            this._next = nextStateInfos;
        }
    };

    arrayEach(['waiting', 'loading', 'registered', 'loaded', 'aborted'], function(stateText) {
        stateInfos.push(new StateInfo(stateText, stateText.charAt(0).toUpperCase() + stateText.substr(1), LOG_METHODS[stateText]));
    });

    stateInfos[0].setNext([stateInfos[1], stateInfos[2]]);
    stateInfos[1].setNext([stateInfos[2], stateInfos[4]]);
    stateInfos[2].setNext([stateInfos[3], stateInfos[4]]);
    stateInfos[3].setNext([stateInfos[0]]);
    stateInfos[4].setNext([stateInfos[0]]);

    return StateInfo;
});
