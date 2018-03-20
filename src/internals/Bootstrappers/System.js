JARS.internal('Bootstrappers/System', function(getInternal) {
    'use strict';

    /**
     * @namespace
     *
     * @memberof JARS~internals.Bootstrappers
     */
    var System = {
        /**
         * @method
         */
        bootstrap: function() {
            getInternal('Configs/Global').update('modules', {
                restrict: 'System.*',

                basePath: getInternal('Env').INTERNALS_PATH
            });
        }
    };

    return System;
});
