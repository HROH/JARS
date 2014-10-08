JAR.register({
    MID: 'jar.async.Value.M$Decidable',
    deps: ['System::isObject', {
        'jar.lang': [{
            Function: ['::bind', '::identity']
        }, 'MixIn']
    }]
}, function(isObject, bind, identity, MixIn) {
    'use strict';

    var M$Decidable = new MixIn('Decidable', {
        decide: function(decider, decisionTable) {
            var decidedValue = new this.Class(),
                decision, subscriptionID;

            if (isObject(decider)) {
                decisionTable = decider;
                decider = identity;
            }

            this.onUpdate(function makeDecision(newValue) {
                var nextDecision = decisionTable[decider(newValue)];

                if (nextDecision) {
                    if (decision !== nextDecision) {
                        decision && decision.unsubscribe(subscriptionID);

                        decision = nextDecision;

                        subscriptionID = decision.subscribe({
                            onUpdate: bind(decidedValue.assign, decidedValue),

                            onError: bind(decidedValue.error, decidedValue)
                        });
                    }
                }
                else {
                    decidedValue.error(new Error('No decision possible'));
                }
            });

            return decidedValue;
        }
    }, {
        classes: [this]
    });

    return M$Decidable;
});