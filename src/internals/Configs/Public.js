JARS.internal('Configs/Public', function(getInternal) {
    'use strict';

    var create = getInternal('Helpers/Object').create;

    /**
     * @class
     *
     * @memberof JARS~internals.Configs
     */
    function Public() {}

    /**
     * @param {JARS~internals.Configs.Public} parentConfig
     *
     * @return {JARS~internals.Configs.Public}
     */
    Public.childOf = function(parentConfig) {
        return create(Public, parentConfig);
    };

    return Public;
});
