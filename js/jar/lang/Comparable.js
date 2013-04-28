// Example for an Interface
JAR.register({
	MID: "jar.lang.Comparable",
	deps: ".Interface"
}, function(Iface) {
	var Comparable = new Iface("Comparable", {
		compareTo: 1
	});
	
	return Comparable;
});