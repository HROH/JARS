// Example for an Interface
JAR.register({
    MID: 'jar.lang.I$Iterable',
    deps: '.Interface'
}, function(Iface) {
    var I$Iterable = new Iface('Iterable', [
        ['iterator', 0]
    ]);

    return I$Iterable;
});