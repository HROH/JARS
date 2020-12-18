(function(karma) {
    'use strict';

    karma.loaded = function() {};

    JARS.configure({
        modules: {
            restrict: 'tests.*',

            basePath: 'base',

            timeout: 1,

            fileName: function(fileName) {
                return fileName + '-spec';
            }
        },

        debugging: {
            debug: true,

            level: 'error'
        }
    });

    JARS.module('test-start').$import(['tests.*']).$export(function() {
        karma.start();
    });

    JARS.main('test-start');
})(window.__karma__);
