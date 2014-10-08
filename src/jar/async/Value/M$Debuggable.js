JAR.register({
    MID: 'jar.async.Value.M$Debuggable',
    deps: 'jar.lang.MixIn'
}, function(MixIn) {
    'use strict';

    var M$Debuggable = new MixIn('Debuggable', {
        debug: function() {
            var logger = this.Class.logger,
                hash = this.getHash();

            return this.subscribe({
                onUpdate: function(newValue) {
                    logger.log('Got update for ${hash} with value ${val}', {
                        hash: hash,

                        val: newValue
                    });
                },

                onError: function(newError) {
                    logger.error('Got error for ${hash} with message ${msg}', {
                        hash: hash,

                        msg: newError.message
                    });
                },

                onFreeze: function() {
                    logger.log('Froze ${hash}', {
                        hash: hash
                    });
                }
            });
        }
    }, {
        classes: [this]
    });
    
    return M$Debuggable;
});