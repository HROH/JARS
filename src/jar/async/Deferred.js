JAR.module('jar.async.Deferred').$import([
    '.Promise',
    '.Value',
    '..lang.Class'
]).$export(function(Promise, Value, Class) {
    'use strict';

    var Deferred = Class('Deferred', {
        $: {
            construct: function() {
                var deferred = this,
                    value = deferred._$value = new Value();

                deferred._$promise = new Promise(function(resolve, reject, notify) {
                    value.subscribe({
                        onUpdate: function(data) {
                            (data.resolve ? resolve : notify)(data.value);
                        },
                        
                        onError: reject
                    });
                });
            },

            getPromise: function() {
                return this._$promise;
            },

            resolve: function(value) {
                this._$value.assign({
                    resolve: true,
                    
                    value: value
                });

                return this;
            },

            reject: function(reason) {
                this._$value.error(reason);

                return this;
            },

            notify: function(info) {
                this._$value.assign({
                    value: info
                });

                return this;
            }
        },

        _$: {
            value: null,

            promise: null
        }
    });

    Deferred.addDestructor(function() {
        this.reject(new Error('The connected deferred ' + this.getHash() + ' was destructed!'));
    });

    return Deferred;
});