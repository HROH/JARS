// Example for an Interface
JAR.register({
    MID: 'jar.lang.I$Iterable',
    deps: '.Interface'
}, function(Interface) {
    'use strict';

    var I$Iterable = new Interface('Iterable', [
        ['iterator', 0]
    ]);

    return I$Iterable;
});