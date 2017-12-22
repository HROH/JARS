JARS.module('System.Transports', ['Console']).$import(['.!', '.::$$internals']).$export(function(config, internals) {
    'use strict';

    var hasOwnProp = internals.get('Utils').hasOwnProp,
        transports = {},
        Transports;

    Transports = {
        /**
         * @param {string} mode
         * @param {object} transport
         */
        add: function(mode, transport) {
            if (!hasOwnProp(transports, mode)) {
                transports[mode] = transport;
            }
        },

        write: function(mode, level, context, data) {
            var transport = transports[mode];

            transport && (transport[level] ? transport[level](context, data) : transport.write(level, context, data));
        },
        /**
         * @param {JARS.internals.Interception} pluginRequest
         */
        $plugIn: function(pluginRequest) {
            var data = pluginRequest.info.data.split(':');

            pluginRequest.$importAndLink(data[1], function addTransport(Transport) {
                Transports.add(data[0], new Transport());

                pluginRequest.success(Transports);
            });
        }
    };

    return Transports;
});
