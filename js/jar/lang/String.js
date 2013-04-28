JAR.register({
	MID: "jar.lang.String",
	deps: [".Array", ".Object"]
}, function(Arr, Obj) {
	var lang = this, StringCopy = lang.copyNative("String");
    // TODO
    // bug in chrome?: new StringCopy() sometimes can't access added methods
    // solved temporary by using StringCopy.fromNative() with  while loop
    // search for course/better solution
    StringCopy.fromNative = function(string) {
		string = string || "";
        if(lang.isString(string)) {
			while(!(string instanceof StringCopy)) {
				string = new StringCopy(string);
            }
        }
        return string;
    };
        
    /**
     * Extend jar.lang.String with some useful methods
     * If a native implementation exists it will be used instead
     */
	StringCopy.prototype.extend({
        camelize: function() {
			var start, toCapitalize, camelized = "";
			toCapitalize = this.split("-");
			toCapitalize = toCapitalize.concat(Arr.fromArgs(arguments));
			start = toCapitalize.shift();
			camelized = Arr.fromNative(toCapitalize).reduce(function(startString, nextString) {
				return startString + StringCopy.fromNative(nextString).capitalize();
			}, start);
			
            return StringCopy.fromNative(camelized);
        },
        
        capitalize: function() {
            return StringCopy.fromNative(this.charAt(0).toUpperCase() + this.substr(1).toLowerCase());
        },
		
		startsWith: function(start, mode) {
			var rstart = new RegExp("^" + start, mode);
			return rstart.test(this);
		},
		
		endsWith: function(end, mode) {
			var rend = new RegExp(end + "$", mode);
			return rend.test(this);
		}
	});
    
    return StringCopy;
});