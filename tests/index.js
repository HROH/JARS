(function(karma) {
    'use strict';

    karma.loaded = function() {};

    JARS.configure({
        modules: {
            basePath: 'base/tests',

            timeout: 1
        },

        debugging: {
            debug: true,

            level: 'error'
        }
    });

    JARS.module('tests').$import(['internals-spec.*']).$export(function() {
        karma.start();
    });

    JARS.main('tests');
})(window.__karma__);
