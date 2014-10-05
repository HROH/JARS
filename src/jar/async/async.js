JAR.register({
    MID: 'jar.async',
    deps: '.lang.Array',
    bundle: ['Deferred', 'Importer', 'Number', 'Promise', 'Request', 'Value.*']
}, function(Arr) {
    'use strict';

    var async = {
        wait: function(fn, wait) {
            var args = Arr.from(arguments, 2);

            window.setTimeout(function tick() {
                fn.apply(null, args);
            }, Number(wait) || 0);
        }
    };

    return async;
});