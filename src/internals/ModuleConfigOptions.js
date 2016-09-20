JARS.internal('ModuleConfigOptions', function(InternalsManager) {
    'use strict';

    var create = InternalsManager.get('Utils').create;

    /**
     * @class
     *
     * @memberof JARS.internals
     */
    function ModuleConfigOptions() {
        this.config = create(PublicModuleConfig, this.config);
    }

    /**
     * @class
     *
     * @memberof JARS.internals.ModuleConfigOptions
     * @inner
     */
    function PublicModuleConfig() {}

    return ModuleConfigOptions;
});
