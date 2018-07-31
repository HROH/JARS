JARS.internal('Logger/Transports', function(getInternal) {
    'use strict';

    var each = getInternal('Helpers/Array').each;

    /**
     * @class
     *
     * @memberof JARS~internals.Logger
     *
     * @param {JARS~internals.Logger.Transports~Transport[]} transports
     */
    function Transports(transports) {
        this._transports = transports;
    }

    Transports.prototype = {
        constructor: Transports,
        /**
         * @param {JARS~internals.Logger.Transports~Transport} transport
         */
        add: function(transport) {
            this._transports.push(transport);
        },
        /**
         * @param {string} level
         * @param {string} context
         * @param {Object} data
         */
        write: function(level, context, data) {
            var transports = this;

            each(this._transports, function(transport) {
                transports._writeToTransport(transport, level, context, data);
            });
        },
        /**
         * @param {JARS~internals.Logger.Transports~Transport} transport
         * @param {string} level
         * @param {string} context
         * @param {Object} data
         */
        _writeToTransport: function(transport, level, context, data) {
            transport[level] ? transport[level](context, data) : transport.write(level, context, data);
        }
    };

    return Transports;
});
