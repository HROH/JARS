JAR.register({
	MID: "jar.lang.Function",
	deps: [".Array", ".Object"]
}, function(Arr, Obj) {
    var lang = this, Fn;
	
	Fn = function(fn) {
        if(lang.isFunction(fn)) {
            var selectedContext,
				execContext,
                predefinedArgs = [],
                placeHolderArgs = new Arr();

            var FnHandler = function() {
				var newArgs = Arr.fromArgs(arguments),
					args = placeHolderArgs.map(function(arg) {
	                    return newArgs.shift() || arg;
	                });
	            
                execContext = selectedContext || this;
                return fn.apply(execContext, predefinedArgs.concat(args, newArgs));
            };
			
			/**
			 * Set a new context for the Function fn
			 * Additional arguments are stored in predefinedArgs and are used in the call to fn
			 * 
			 * @param Object newContext
			 * 
			 */
            FnHandler.remap = function(newContext) {
				selectedContext = newContext;
                FnHandler.partial.apply(null, Arr.fromArgs(arguments).slice(1));
                return FnHandler;
            };
            
            FnHandler.unmap = function() {
				selectedContext = null;
				return FnHandler;
            };
			/**
			 * Similar to FnHandler.remap
			 * but it returns a new FnHandler instead of only overwriting the context
			 */
			FnHandler.bind = FnHandler.hitch = function() {
				return Fn(fn).remap.apply(null, arguments);
			};
			/**
			 * Store the arguments in predefinedArgs
			 * They will be used in the call to fn
			 */
            FnHandler.partial = function() {
                predefinedArgs = predefinedArgs.concat(Arr.fromArgs(arguments));
                return FnHandler;
            };
			/**
			 * Store the arguments in placeholderArgs
			 * They will be used in the call to fn as default if no other arguments are available
			 * 
			 * Example:
			 * 
			 * function(a) {
			 *	return a || value;
			 * }
			 * 
			 * This would be equal to:
			 * 
			 * jar.lang.Function(function(a) {
			 *	return a;
			 * }).preset(value);
			 * 
			 * This may be only useful in a few cases
			 */
            FnHandler.preset = function() {
                placeHolderArgs = Arr.fromArgs(arguments);
                return FnHandler;
            };
            /**
             * Repeat the given function n times
             * The first parameter refers to the current execution time
             *
             * jar.lang.Function(function(time) {
             *	jar.lang.debug(time + " time(s) executed");
             * }).repeat(5);
             * 
             * outputs:
             * 
             * "1 time(s) executed"
             * "2 time(s) executed"
             * "3 time(s) executed"
             * "4 time(s) executed"
             * "5 time(s) executed"
             */
            FnHandler.repeat = function(times) {
				for(var i = 1; i <= times; i++) {
					FnHandler.apply(this, [i].concat(Arr.fromArgs(arguments).slice(1)));
				}
            };

            return FnHandler;
        }
        return fn;
    };
    
    return Fn;
});