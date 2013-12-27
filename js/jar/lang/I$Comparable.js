// Example for an Interface
JAR.register({
    MID: 'jar.lang.I$Comparable',
    deps: '.Interface'
}, function(Iface) {
    var I$Comparable = new Iface('Comparable', [
        ['compareTo', 1]
    ]);

    return I$Comparable;
});