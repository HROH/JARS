/**
 * @module Transports
 */
JARS.module('System.Transports', ['Console']).meta({
    /**
     * @param {JARS~internals.Subjects.Interception} pluginRequest
     */
    plugIn: function(pluginRequest) {
        var data = pluginRequest.info.data.split(':');

        pluginRequest.$importAndLink(data[1], function addTransport(Transport) {
            this.add(data[0], new Transport());

            pluginRequest.success(this);
        });
    }
}).$import(['.!', '.::$$internals']).$export(function(config, internals) {
    'use strict';

    var hasOwnProp = internals.get('Helpers/Object').hasOwnProp,
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
            if (!hasOwnProp(transports, mode)) {
                transports[mode] = transport;
            }
        },
        /**
         * @param {string} mode
         * @param {string} level
         * @param {string} context
         * @param {Object} data
         */
        write: function(mode, level, context, data) {
            var transport = transports[mode];

            transport && (transport[level] ? transport[level](context, data) : transport.write(level, context, data));
        }
    };

    return Transports;
});
