(function globalSetup(envGlobal) {
    'use strict';

    var Env, SourceManager;

    Env = (function envConfigSetup() {
        /**
         * @namespace
         *
         * @memberof JARS~internals
         */
        var Env = {
            /**
             * @type {Global}
             */
            global: envGlobal,
            /**
             * @type {string}
             */
            platform: 'node',
            /**
             * @type {string}
             */
            MAIN_MODULE: envGlobal.process.env.MAIN_MODULE,
            /**
             * @type {string}
             */
            BASE_PATH: envGlobal.process.env.BASE_PATH || './',
            /**
             * @type {string}
             */
            INTERNALS_PATH: envGlobal.process.env.INTERNALS_PATH || __dirname + '/internals/'
        };

        return Env;
    })();

    SourceManager = (function sourceManagerSetup() {
        var SourceManager;

        /**
         * @namespace
         *
         * @memberof JARS~internals
         */
        SourceManager = {
            /**
             * @param {string} path
             */
            load: function(path) {
                envGlobal.setTimeout(function() {
                    try {
                        require(require('path').join.apply(null, path.split('/')));
                    } catch (error) {}
                });
            }
        };

        return SourceManager;
    })();

    envGlobal.JARS || SourceManager.load(Env.INTERNALS_PATH + 'JARS.js');

    (function initJARS() {
        envGlobal.setTimeout(function() {
            envGlobal.JARS ? JARS.platform({
                Env: Env,

                SourceManager: SourceManager
            }) : initJARS();
        }, 100);
    })();
})(global);
