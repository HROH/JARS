JAR.register({
	MID: "jar.lang.M$Cloneable",
	deps: ".MixIn"
}, function(MixIn) {
	// TODO only mix in Classes or Instances created with jar.lang.Class
	var M$Cloneable = new MixIn("Cloneable", {
		clone: function() {
			var clone = new this.Class();
			if(clone === this) {
				clone = undefined;
			}

			return clone;
        }
	});
	
	return M$Cloneable;
});