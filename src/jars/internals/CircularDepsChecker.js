JARS.internal('CircularDepsChecker', function circularDepsCheckerSetup(InternalsManager) {
    'use strict';

    var utils = InternalsManager.get('utils'),
        hasOwnProp = utils.hasOwnProp,
        arrayEach = utils.arrayEach,
        CircularDepsChecker;

    CircularDepsChecker = {
        /**
         * @access public
         *
         * @memberof JARS~CircularDepsChecker
         *
         * @param {JARS~Module} module
         *
         * @return {Boolean}
         */
        hasCircularDeps: function(module) {
            var hasCircularDependencies = false,
                circularDependencies;

            if (module.config.get('checkCircularDeps')) {
                circularDependencies = CircularDepsChecker.getCircularDeps(module);
                hasCircularDependencies = !! circularDependencies.length;
            }

            return hasCircularDependencies;
        },
        /**
         * @access public
         *
         * @memberof JARS~CircularDepsChecker
         *
         * @param {JARS~Module} module
         * @param {Object} [traversedModules]
         *
         * @return {Array}
         */
        getCircularDeps: function(module, traversedModules) {
            var moduleName = module.name,
                dependencies = module.getAllDeps(),
                circularDependencies = [];

            traversedModules = traversedModules || {};

            if (hasOwnProp(traversedModules, moduleName)) {
                circularDependencies = [moduleName];
            }
            else {
                traversedModules[moduleName] = true;

                arrayEach(dependencies, function findCircularDeps(dependencyName) {
                    circularDependencies = CircularDepsChecker.getCircularDeps(module.loader.getModule(dependencyName), traversedModules);

                    if (circularDependencies.length) {
                        circularDependencies.unshift(moduleName);

                        return true;
                    }
                });

                delete traversedModules[moduleName];
            }

            return circularDependencies;
        }
    };

    return CircularDepsChecker;
});
