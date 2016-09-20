JARS.internal('ModuleConfigTransforms', function(InternalsManager) {
    'use strict';

    var MIN_TIMEOUT = 0.5,
        STRING_CHECK = 'String',
        OBJECT_CHECK = 'Object',
        BOOLEAN_CHECK = 'Boolean',
        RE_END_SLASH = /\/$/,
        SLASH = '/',
        objectMerge = InternalsManager.get('Utils').objectMerge,
        ModuleConfigTransforms = {};

    addConfigTransform('basePath', STRING_CHECK, ensureEndsWithSlash);

    addConfigTransform('cache', BOOLEAN_CHECK, function cacheTransform(cache) {
        return !!cache;
    });

    addConfigTransform('checkCircularDeps', BOOLEAN_CHECK);

    addConfigTransform('config', OBJECT_CHECK, function configTransform(newConfig, moduleOrBundle) {
        return objectMerge(moduleOrBundle.config.get('config'), newConfig);
    });

    addConfigTransform('dirPath', STRING_CHECK, ensureEndsWithSlash);

    addConfigTransform('extension', STRING_CHECK, function extensionTransform(extension) {
        return '.' + extension;
    });

    addConfigTransform('fileName', STRING_CHECK);

    addConfigTransform('minified', BOOLEAN_CHECK, function minTransform(loadMin) {
        return loadMin ? '.min' : '';
    });

    addConfigTransform('recover', OBJECT_CHECK, function recoverTransform(recoverConfig, moduleOrBundle) {
        // create a copy of the recover-config
        // because it should update for every module independently
        var recover = objectMerge({}, recoverConfig);

        recover.restrict = moduleOrBundle.name;
        // if no next recover-config is given set it explicitly
        // this is important because the recoverflow is as follows:
        // - if the module has a recover-config, use it to update its config
        // - if it has no recover-config look for it in a higher bundle-config
        // - if such a config is found, update the config for the module
        // - when the module-config is updated, options will always be overwritten but never deleted
        // So if the module has a recover-config that doesn't get replaced
        // it may repeatedly try to recover with this config
        recover.recover || (recover.recover = null);

        return recover;
    });

    addConfigTransform('timeout', 'Number', function timeoutTransform(timeout) {
        return (timeout > MIN_TIMEOUT ? timeout : MIN_TIMEOUT);
    });

    addConfigTransform('versionDir', STRING_CHECK, ensureEndsWithSlash);

   /**
    * @memberof JARS.internals.ModuleConfigTransforms
    * @inner
    *
    * @param {string} path
    *
    * @return {string}
    */
   function ensureEndsWithSlash(path) {
       return (!path || RE_END_SLASH.test(path)) ? path : path + SLASH;
   }

   /**
    * @memberof JARS.internals.ModuleConfigTransforms
    * @inner
    *
    * @param {string} configKey
    * @param {string} typeCheck
    * @param {JARS.internals.ModuleConfigTransforms.TransformFunction} [transform]
    */
   function addConfigTransform(configKey, typeCheck, transform) {
       ModuleConfigTransforms[configKey] = {
           check: typeCheck,

           transform: transform
       };
   }

   /**
    * @callback TransformFunction
    *
    * @memberof JARS.internals.ModuleConfigTransforms
    * @inner
    *
    * @param {*} configValue
    * @param {(JARS.internals.Module|JARS.internals.ModuleBundle)} [moduleOrBundle]
    */

    return ModuleConfigTransforms;
});
