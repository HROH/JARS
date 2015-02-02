JAR.module('jar.async.I$Executor').$import('jar.lang.Interface').$export(function(Interface) {
    'use strict';

    var I$Executor = new Interface('Executor', [
		['request', 1],
		['cancel', 1]
    ]);

    return I$Executor;
});