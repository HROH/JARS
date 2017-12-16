JARS.internal('Processors/Module', function(getInternal) {
    'use strict';

    var AutoAborter = getInternal('AutoAborter'),
        getFullPath = getInternal('PathManager').getFullPath,
        loadSource = getInternal('SourceManager').load;

    function ModuleProcessor(module) {
        this.module = module;
    }

    ModuleProcessor.prototype = {
        constructor: ModuleProcessor,

        load: function() {
            var module = this.module,
                path = getFullPath(module);

            if (module.state.setLoading()) {

                AutoAborter.setup(module, path);

                loadSource(module.name, path);
            }
        },

        register: function(registerCallback) {
            var module = this.module;

            if (module.state.setRegistered()) {
                AutoAborter.clear(module);

                module.deps.request(registerCallback);
            }
        }
    };

    return ModuleProcessor;
});
