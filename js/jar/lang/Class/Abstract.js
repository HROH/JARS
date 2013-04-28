JAR.register({
	MID: "jar.lang.Class.Abstract"
}, function() {
	var Class = this, AbstractClass;
	
	AbstractClass = function(name, proto) {
		return Class(name, proto).toAbstract();
	};
	
	return AbstractClass;
});