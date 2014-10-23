JAR.register({
    MID: 'jar.async.Value.M$Debuggable',
    deps: [{
        System: ['::isA', 'Logger']
    }, {
        'jar.lang': ['MixIn', 'Object']
    }]
}, function(isA, Logger, MixIn, Obj) {
    'use strict';

    var debuggedValues = {},
        M$Debuggable;

    M$Debuggable = new MixIn('Debuggable', {
        debug: function(customLogger) {
            var logger = isA(customLogger, Logger) ? customLogger : this.Class.logger,
                hash = this.getHash(),
                data = {
                    hash: hash
                },
                subscription;

            if (!debuggedValues[hash]) {
                subscription = this.subscribe({
                    onUpdate: function(newValue) {
                        logger.log('Got update for ${hash} with value ${val}', Obj.extend({
                            val: newValue
                        }, data));
                    },

                    onError: function(newError) {
                        logger.error('Got error for ${hash} with message ${msg}', Obj.extend({
                            msg: newError.message
                        }, data));
                    },

                    onFreeze: function() {
                        logger.log('Froze ${hash}', Obj.copy(data));
                    }
                });

                subscription && (debuggedValues[hash] = subscription);
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