JAR.register({
	MID: "jar.lang.Cloneable",
	deps: ".MixIn"
}, function(MixIn) {
	// TODO only mixin in Classes or Instances created with jar.lang.Class
	var Cloneable = new MixIn("Cloneable", {
		clone: function() {
			var clone = new this.Class();
			if(clone === this) {
				clone = undefined;
			}

			return clone;
        }
	});
	
	return Cloneable;
});