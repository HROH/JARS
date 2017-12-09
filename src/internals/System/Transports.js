JARS.module('System.Transports').$import([
    '.!', '.::$$internals', '.::isFunction', '.ConsoleTransport', '.LogLevels'
]).$export(function(config, internals, isFunction, ConsoleTransport, LogLevels) {
    'use strict';

    var hasOwnProp = internals.get('Utils').hasOwnProp,
        transports = {},
        Transports;

    Transports = {
        /**
         * @param {string} mode
         * @param {function()} Transport
         */
        add: function(mode, Transport) {
            var modeConfig = mode + 'Config';

            if (!hasOwnProp(transports, mode) && isFunction(Transport)) {
                transports[mode] = new Transport(function transportConfigGetter(option) {
                    return (config[modeConfig] || {})[option];
                }, LogLevels);
            }
        },
        /**
         * @param {string} mode
         *
         * @return {Object}
         */
        getActive: function(mode) {
            return transports[mode] || transports.console;
        },
        /**
         * @param {JARS.internals.Interception} pluginRequest
         */
        $plugIn: function(pluginRequest) {
            var data = pluginRequest.info.data.split(':');

            pluginRequest.$importAndLink(data[1], function addTransport(Transport) {
                Transports.add(data[0], Transport);

                pluginRequest.success(Transports);
            });
        }
    };

    Transports.add('console', ConsoleTransport);

    return Transports;
});
