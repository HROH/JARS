JARS.internal('ConfigOptions', function configOptionsSetup(InternalsManager) {
    'use strict';

    var create = InternalsManager.get('Utils').create;

    /**
     * @class
     *
     * @memberof JARS.internals
     */
    function ConfigOptions() {
        this.config = create(PublicConfig, this.config);
    }

    /**
     * @class
     *
     * @memberof JARS.internals.ConfigOptions
     * @inner
     */
    function PublicConfig() {}

    return ConfigOptions;
});
