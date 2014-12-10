JAR.register({
    MID: 'jar.async.I$Executor',
    deps: 'jar.lang.Interface'
}, function(Interface) {
    'use strict';

    var I$Executor = new Interface('Executor', [
		['request', 1],
		['cancel', 1]
    ]);

    return I$Executor;
});