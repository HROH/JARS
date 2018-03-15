JARS.internal('States/Info', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each,
        IS_PREFIX = 'is',
        SET_PREFIX = 'set',
        LOG_METHODS = {},
        stateInfos = [];

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
     * @class
     *
     * @memberof JARS~internals.States
     *
     * @param {string} stateText
     * @param {string} stateMethodText
     * @param {Object} logMethods
     */
    function Info(stateText, stateMethodText, logMethods) {
        this.text = stateText;
        this.methods = logMethods;
        this.is = IS_PREFIX + stateMethodText;
        this.set = SET_PREFIX + stateMethodText;
    }

    /**
     * @return {JARS~internals.States.Info}
     */
    Info.initial = function() {
        return stateInfos[0];
    };

    /**
     * @param {function(JARS~internals.States.Info)} callback
     */
    Info.each = function(callback) {
        each(stateInfos, callback);
    };

    Info.prototype = {
        constructor: Info,
        /**
         * @param {JARS~internals.States.Info} nextStateInfo
         *
         * @return {boolean}
         */
        hasNext: function(nextStateInfo) {
            return this._next.indexOf(nextStateInfo) > -1;
        },
        /**
         * @param {JARS~internals.States.Info[]} nextStateInfos
         */
        setNext: function(nextStateInfos) {
            this._next = nextStateInfos;
        }
    };

    each(['waiting', 'loading', 'registered', 'intercepted', 'loaded', 'aborted'], function(stateText) {
        stateInfos.push(new Info(stateText, stateText.charAt(0).toUpperCase() + stateText.substr(1), LOG_METHODS[stateText]));
    });

    stateInfos[0].setNext([stateInfos[1], stateInfos[2], stateInfos[5]]);
    stateInfos[1].setNext([stateInfos[2], stateInfos[5]]);
    stateInfos[2].setNext(stateInfos.slice(3));
    stateInfos[3].setNext(stateInfos.slice(3));
    stateInfos[4].setNext([stateInfos[0]]);
    stateInfos[5].setNext([stateInfos[0]]);

    return Info;
});
