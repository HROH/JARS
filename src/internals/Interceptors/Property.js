JARS.internal('Interceptors/Property', function partialModuleInterceptorSetup(getInternal) {
    'use strict';

    // TODO allow search for nested properties
    var hasOwnProp = getInternal('Utils').hasOwnProp,
        PartialModuleInterceptor;

    /**
    * @namespace
    * @implements JARS.internals.Interceptor
    *
    * @memberof JARS.internals
    */
    PartialModuleInterceptor = {
        /**
         * @param {*} moduleRef
         * @param {JARS.internals.Intereption} interception
         */
        intercept: function(moduleRef, interception) {
            var property = interception.info.data;

            if (moduleRef && hasOwnProp(moduleRef, property)) {
                interception.success(moduleRef[property]);
            }
            else {
                interception.fail('The module has no property "' + property + '"');
            }
        },
        /**
         * @type {string}
         */
        type: '::'
    };

    return PartialModuleInterceptor;
});
