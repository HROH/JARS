// Example for an Interface
JAR.register({
	MID: "jar.lang.Iterable",
	deps: ".Interface"
}, function(Iface) {
	var Iterable = new Iface("Iterable", {
		iterator: 0
	});

	return Iterable;
});