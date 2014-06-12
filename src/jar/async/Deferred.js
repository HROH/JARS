JAR.register({
    MID: 'jar.async.Deferred',
    deps: ['.Promise', '..lang.Class']
}, function(Promise, Class) {
    'use strict';
	
	var Deferred = Class('Deferred', {
        $: {
            construct: function() {
                var deferred = this,
                    promise;

                promise = deferred._$promise = new Promise(null, true);

                deferred._$handles = this.$proxy(promise, proxiedGetPromiseHandles);
            },

            getPromise: function() {
                return this._$promise;
            },

            resolve: function(value) {
                this._$handles.resolve(value);

                return this;
            },

            reject: function(reason) {
                this._$handles.reject(reason);

                return this;
            },

            notify: function(info) {
                this._$handles.notify(info);

                return this;
            }
        },

        _$: {
            handles: null,

            promise: null
        }
    });

    function proxiedGetPromiseHandles() {
        return this._$handles;
    }

    Deferred.addDestructor(function() {
        this.reject('The Deferred: ' + this.getHash() + ' was destructed!');
    });

    return Deferred;
});