JAR.register({
    MID: 'jar.async.Importer',
    deps: ['..', '..lang.Array', '.Deferred']
}, function(jar, Arr, Deferred) {
    'use strict';

    var async = this,
        Importer;

    Importer = Deferred.createSubClass('Importer', {
        $import: function(moduleNames) {
            var deferred = this;

            async.wait(function() {
                jar.$importLazy(moduleNames, function() {
                    deferred.resolve(Arr.from(arguments));
                }, function(abortedModuleName) {
                    deferred.reject(new Error(abortedModuleName));
                }, function(module, percentageLoaded) {
                    deferred.notify({
                        module: module,
                        percentage: percentageLoaded
                    });
                });
            }, 10);

            return deferred.getPromise();
        }
    }, {
        $import: function(moduleNames) {
            return new Importer().$import(moduleNames);
        }
    });

    return Importer;
});