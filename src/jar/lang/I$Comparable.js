// Example for an Interface
JAR.register({
    MID: 'jar.lang.I$Comparable',
    deps: '.Interface'
}, function(Interface) {
    'use strict';

    var I$Comparable = new Interface('Comparable', [
        ['compareTo', 1]
    ]);

    return I$Comparable;
});