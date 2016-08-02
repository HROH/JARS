JAR.internal('PartialModuleInterceptor', function partialModuleInterceptorSetup(InternalsManager) {
    // TODO allow search for nested properties
    var hasOwnProp = InternalsManager.get('utils').hasOwnProp, PartialModuleInterceptor;

    PartialModuleInterceptor = {
        intercept: function(moduleRef, interception) {
            var property = interception.info.data;

            if (moduleRef && hasOwnProp(moduleRef, property)) {
                interception.success(moduleRef[property]);
            }
            else {
                interception.fail('The module has no property "' + property + '"');
            }
        },

        type: '::'
    };

    return PartialModuleInterceptor;
});
