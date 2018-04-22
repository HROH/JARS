(function(envGlobal) {
    'use strict';

    var Env, SourceManager;

    Env = (function envConfigSetup() {
        var scripts = envGlobal.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            Env;

        /**
         * @namespace
         *
         * @memberof JARS~internals
         */
        Env = {
            /**
             * @type {Global}
             */
            global: envGlobal,
            /**
             * @type {string}
             */
            MAIN_MODULE: getData('main'),
            /**
             * @type {string}
             */
            BASE_PATH: getData('base') || './',
            /**
             * @type {string}
             */
            INTERNALS_PATH: getData('internals') || script.src.substring(0, script.src.lastIndexOf('/')) + '/internals/'
        };

        /**
         * @memberof JARS~internals.Env
         * @inner
         *
         * @param {string} key
         *
         * @return {string}
         */
        function getData(key) {
            return script.getAttribute('data-' + key);
        }

        return Env;
    })();

    SourceManager = (function sourceManagerSetup() {
        var doc = envGlobal.document,
            head = doc.getElementsByTagName('head')[0],
            SourceManager;

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
                var script = doc.createElement('script');

                head.appendChild(script);

                script.type = 'text/javascript';
                script.src = path;
                script.async = true;
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
})(window);
