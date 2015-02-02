JAR.module('jar.async.Importer').$import([
    '..',
    '..lang.Array',
    '.Deferred',
    '.TimeoutExecutor'
]).$export(function(jar, Arr, Deferred, TimeoutExecutor) {
    'use strict';

    var delayedExecutor = new TimeoutExecutor(10),
        Importer;

    Importer = Deferred.createSubClass('Importer', {
        $import: function(moduleNames) {
            var deferred = this;

            delayedExecutor.request(function() {
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
            });

            return deferred.getPromise();
        }
    }, {
        $import: function(moduleNames) {
            return new Importer().$import(moduleNames);
        }
    });

    return Importer;
});