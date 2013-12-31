JAR.register({
    MID: 'jar.lang.Function',
    deps: ['..', 'System', '.Array', '.Object']
}, function(jar, System, Arr, Obj) {
    var lang = this,
        fnConverter = lang.sandbox('function(fn) { return function() { return fn.apply(this, arguments);} }', '__SYSTEM__'),
        FunctionCopy = jar.getConfig('allowProtoOverwrite') ? Function : lang.sandbox('Function', '__SYSTEM__'),
        fromArray = Arr.from,
        FunctionCopyProto;

    FunctionCopyProto = {
        bind: function(context) {
            var fnToBind = this,
                FnLink = function() {},
                boundArgs = fromArray(arguments, 1),
                boundFn = fromFunction(function() {
                    return fnToBind.apply((System.isA(this, FnLink) && context) ? this : context, boundArgs.concat(fromArray(arguments)));
                });

            FnLink.prototype = fnToBind.prototype;
            boundFn.prototype = new FnLink();
            boundFn.args = fnToBind.length;

            return boundFn;
        },

        partial: function() {
            var partialFn = this,
                partialArgs = fromArray(arguments);

            return fromFunction(function() {
                var newArgs = fromArray(arguments),
                    args = partialArgs.map(applyPartialArg, newArgs);

                return partialFn.apply(this, args.concat(newArgs));
            });
        },
        /**
         * Store the arguments in placeholderArgs
         * They will be used in the call to func as default if no other arguments are available
         * 
         * Example:
         * 
         * function(a) {
         *	return a || value;
         * }
         * 
         * This would be equal to:
         * 
         * jar.lang.Function.from(function(a) {
         *	return a;
         * }).preset(value);
         *
         * 
         *
         *
         */
        preset: function() {
            var placeholderFn = this,
                placeholderArgs = fromArray(arguments);

            return fromFunction(function() {
                var newArgs = fromArray(arguments),
                    args = placeholderArgs.map(applyPlaceholderArg, newArgs);

                return placeholderFn.apply(this, args.concat(newArgs));
            });
        },
        /**
         * Repeat the given function n times
         * The last parameter refers to the current execution time
         *
         * jar.lang.Function.from(function(time) {
         *	System.out(time + ' time(s) executed');
         * }).repeat(5);
         * 
         * outputs:
         * 
         * '1 time(s) executed'
         * '2 time(s) executed'
         * '3 time(s) executed'
         * '4 time(s) executed'
         * '5 time(s) executed'
         */
        repeat: function(times) {
            var args = fromArray(arguments, 1),
                results = Arr(),
                idx = 0;

            for (; idx < times;) {
                results[idx] = this.apply(this, args.concat(++idx));
            }

            return results;
        }
    };

    FunctionCopy.prototype.extend(FunctionCopyProto);

    FunctionCopy.fromNative = FunctionCopy.from = fromFunction;

    Obj.each(FunctionCopyProto, function(method, methodName) {
        lang.delegate(FunctionCopy.prototype, FunctionCopy, methodName, System.isFunction);
    });

    function applyPartialArg(partialArg) {
        return System.isNull(partialArg) ? this.shift() : partialArg;
    }

    function applyPlaceholderArg(arg) {
        var newArgs = this,
            newArg;

        if (newArgs.length) {
            newArg = newArgs.shift();

            System.isNull(newArg) || (arg = newArg);
        }

        return arg;
    }
    
    function fromFunction(fn) {
        return (System.isA(fn, FunctionCopy) || !System.isFunction(fn)) ? fn : fnConverter(fn);
    }

    return FunctionCopy;
});