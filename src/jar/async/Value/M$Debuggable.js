JAR.register({
    MID: 'jar.async.Value.M$Debuggable',
    deps: [{
        System: ['::isA', 'Logger'],
        'jar.lang': ['MixIn', 'Object']
    }]
}, function(isA, Logger, MixIn, Obj) {
    'use strict';

    var debuggedValues = {},
        M$Debuggable,
        MSG_VALUE_UPDATE = 'Got update for ${hash} with value ${val}',
        MSG_VALUE_ERROR = 'Got error for ${hash} with message ${msg}',
        MSG_VALUE_FREEZE = 'Froze ${hash}';

    M$Debuggable = new MixIn('Debuggable', {
        debug: function(customLogger) {
            var logger = isA(customLogger, Logger) ? customLogger : this.Class.logger,
                hash = this.getHash(),
                data = {
                    hash: hash
                },
                subscriptionID;

            if (!debuggedValues[hash]) {
                subscriptionID = this.subscribe({
                    onUpdate: function(newValue) {
                        logger.log(MSG_VALUE_UPDATE, Obj.extend({
                            val: newValue
                        }, data));
                    },

                    onError: function(newError) {
                        logger.error(MSG_VALUE_ERROR, Obj.extend({
                            msg: newError.message
                        }, data));
                    },

                    onFreeze: function() {
                        logger.log(MSG_VALUE_FREEZE, Obj.copy(data));
                    }
                });

                subscriptionID && (debuggedValues[hash] = subscriptionID);
            }

            return this;
        },

        undebug: function() {
            var hash = this.getHash(),
                subscription = debuggedValues[hash];

            delete debuggedValues[hash];

            return this.unsubscribe(subscription);
        }
    }, {
        classes: [this]
    });

    return M$Debuggable;
});