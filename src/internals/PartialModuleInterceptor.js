JARS.internal('PartialModuleInterceptor', function partialModuleInterceptorSetup(InternalsManager) {
    'use strict';

    // TODO allow search for nested properties
    var hasOwnProp = InternalsManager.get('utils').hasOwnProp, PartialModuleInterceptor;

    /**
    * @access public
    *
    * @namespace PartialModuleInterceptor
    * @implements JARS~InterceptionManager~Interceptor
    *
    * @memberof JARS
    * @inner
    */
    PartialModuleInterceptor = {
        /**
         * @access public
         *
         * @memberof JARS~PartialModuleInterceptor
         *
         * @param {*} moduleRef
         * @param {JARS~Intereption} interception
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
         * @access public
         *
         * @memberof JARS~PartialModuleInterceptor
         *
         * @property {String}
         */
        type: '::'
    };

    return PartialModuleInterceptor;
});
