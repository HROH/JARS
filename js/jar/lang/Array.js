JAR.register({
	MID: "jar.lang.Array",
	deps: ".Object"
}, function(Obj) {
    var lang = this, ArrayCopy = lang.copyNative("Array"),
        TE = TypeError;
        
        /**
         * Extend jar.lang.Array with some useful methods
         * If a native implementation exists it will be used instead
         */
        ArrayCopy.prototype.extend({
			indexOf: function (searchElement) {
				var t = Obj(this), i, len = t.length >>> 0, n = 0;
				
				if (lang.isNull(this)) {
					throw new TE();
				}
				
				if (len === 0) {
					return -1;
				}
				
				if (arguments.length > 1) {
					n = Number(arguments[1]);
					if (n != n) {
						n = 0;
					} else if (n !== 0 && n != Infinity && n != -Infinity) {
						n = (n > 0 || -1) * Math.floor(Math.abs(n));
					}
				}
				
				if (n >= len) {
					return -1;
				}
				
				i = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
				for (; i < len; i++) {
					if (t[i] === searchElement) {
						return i;
					}
				}
				return -1;
			},
		
            forEach: function(fn) {
				var t = Obj(this), i = 0, len = t.length >>> 0;
				
				if(lang.isNull(this)) {
					throw new TE();
				}
				
				if(!lang.isFunction(fn)) {
					throw new TE();
				}
				
				if(arguments.length > 1) {
					t = arguments[1];
				}
				
                while(i < len) {
                    fn.call(t, this[i], i, this);
                    i++;
                }
            },
            
            each: function() {
				this.forEach.apply(this, arguments);
            },
            
            filter: function(fn) {
                var ret = new ArrayCopy();
				
				if(lang.isNull(this)) {
					throw new TE();
				}

                if (!lang.isFunction(fn)) {
                    throw new TE();
                }

                this.each(function(item) {
                    if(fn(item)) {
                        ret.push(item);
                    }
                });

                return ret;
            },
            
            reduce: function(fn) {
                var len = this.length >>> 0,
                    argl = arguments.length, i = 0, ret;
				
				if(lang.isNull(this)) {
					throw new TE();
				}

                if (!lang.isFunction(fn)) {
                    throw new TE();
                }

                if (len === 0 && argl == 1) {
                    throw new TE();
                }

                if (argl >= 2) {
                    ret = arguments[1];
                }
                else {
                    do {
                        if (i in this) {
                            ret = this[i++];
                            break;
                        }

                        if (++i >= len) {
                            throw new TE();
                        }
                    }
                    while (true);
                }

                for(; i < len; i++) {
                    ret = fn(ret, this[i], i, this);
                }

                return ret;
            },
            
            map: function(fn) {
                var t = Obj(this), ret = new ArrayCopy();
				
				if(lang.isNull(this)) {
					throw new TE();
				}

                if (!lang.isFunction(fn)) {
                    throw new TE();
                }
                
                this.each(function(item, i) {
                    ret.push(fn.call(t, item, i, t));
                });

                return ret;
            },
            
            merge: function(array) {
				var t = this;
				array = ArrayCopy.fromNative(array);
				array.each(function(item) {
					t.push(item);
				});
            },
			
			mergeUnique: function(array) {
				var t = Obj(this);

				ArrayCopy.fromNative(array).each(function(item) {
					if(t.indexOf(item) == -1) {
						t.push(item);
					}
				});
				return this;
			},

            removeAll: function(array) {
				var t = Obj(this);
				array = ArrayCopy.fromNative(array);
				array.each(function(item) {
					var index = t.indexOf(item);
					if(index != -1) {
						t.splice(index, 1);
					}
				});
            }
        });
        
        ArrayCopy.extend({
			fromNative: function(array) {
				array = array || [];
				if(!(array instanceof ArrayCopy)) {
		            if(lang.isArray(array) || lang.isArguments(array)) {
						if(array.length > 1) {
							array = ArrayCopy.apply(ArrayCopy, array);
						}
						else {
							var value = array[0];
							array = new ArrayCopy();
							value && array.push(value);
						}
		            }
	            }
	            return array;
            },
            
            fromArgs: function(array, offset) {
				array = this.fromNative(array);
				offset && (array = array.splice(offset));
				return array;
            }
        });
        
    return ArrayCopy;
});