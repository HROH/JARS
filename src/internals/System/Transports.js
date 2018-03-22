/**
 * @module Transports
 */
JARS.module('System.Transports', ['Console']).meta({
    /**
     * @param {JARS~internals.Subjects.Subject} pluginRequest
     */
    plugIn: function(pluginRequest) {
        'use strict';

        var data = pluginRequest.info.data.split(':');

        pluginRequest.$import(data[1]);
        pluginRequest.$export(function(Transport) {
            this.add(data[0], new Transport());

            return this;
        });
    }
}).$import(['.Modules!', '*!Helpers/Object']).$export(function(config, ObjectHelper) {
    'use strict';

    var hasOwnProp = ObjectHelper.hasOwnProp,
        transports = {},
        Transports;

    /**
     * @namespace
     *
     * @memberof module:System
     *
     * @alias module:Transports
     */
    Transports = {
        /**
         * @param {string} mode
         * @param {Object} transport
         */
        add: function(mode, transport) {
            hasOwnProp(transports, mode) || (transports[mode] = transport);
        },
        /**
         * @param {string} mode
         * @param {string} level
         * @param {string} context
         * @param {Object} data
         */
        write: function(mode, level, context, data) {
            hasOwnProp(transports, mode) && writeToTransport(transports[mode], level, context, data);
        }
    };

    /**
     * @memberof module:Transports
     * @inner
     *
     * @param {Object} transport
     * @param {string} level
     * @param {string} context
     * @param {Object} data
     */
    function writeToTransport(transport, level, context, data) {
        transport[level] ? transport[level](context, data) : transport.write(level, context, data);
    }

    return Transports;
});
