JARS.internal('Configs/Options', function(getInternal) {
    'use strict';

    var PublicConfig = getInternal('Configs/Public'),
        OptionsResolver = getInternal('Resolvers/Options'),
        Transforms = getInternal('Configs/Transforms'),
        ObjectHelper = getInternal('Helpers/Object'),
        isBundle = getInternal('Types/Subject').isBundle,
        Validators = getInternal('Types/Validators');

    /**
     * @class
     *
     * @memberof JARS~internals.Configs
     */
    function Options() {
        this.config = new PublicConfig();
    }

    /**
     * @param {JARS~internals.Configs.Options} parentOptions
     *
     * @return {JARS~internals.Configs.Options}
     */
    Options.childOf = function(parentOptions) {
        var childOptions = ObjectHelper.create(Options, parentOptions);

        childOptions.config = PublicConfig.childOf(parentOptions.config);

        return childOptions;
    };

    /**
     * @param {string} subjectName
     *
     * @return {JARS~internals.Configs.Options}
     */
    Options.getDefault = function(subjectName) {
        return isBundle(subjectName) ? new Options() : Options.transformAndUpdate(new Options(), OptionsResolver(subjectName), subjectName);
    };

    /**
     * @param {JARS~internals.Configs.Options} options
     * @param {Object} newOptions
     * @param {string} subjectName
     *
     * @return {JARS~internals.Configs.Options}
     */
    Options.transformAndUpdate = function(options, newOptions, subjectName) {
        ObjectHelper.each(newOptions, function updateConfig(value, option) {
            if (ObjectHelper.hasOwnProp(Transforms, option)) {
                if (Validators.isFunction(value)) {
                    options[option + 'Transform'] = value;
                }
                else if (Validators.isNull(value)) {
                    delete options[option];
                }
                else {
                    options[option] = Transforms[option](value, options[option], subjectName);
                }
            }
        });

        return options;
    };

    ObjectHelper.merge(Options, {
        BASE_PATH: 'basePath',

        CACHE: 'cache',

        CHECK_CIRCULAR_DEPS: 'checkCircularDeps',

        CONFIG: 'config',

        DIR_PATH: 'dirPath',

        EXTENSION: 'extension',

        FILE_NAME: 'fileName',

        MINIFY: 'minify',

        RECOVER: 'recover',

        SCOPE: 'scope',

        TIMEOUT: 'timeout',

        VERSION_PATH: 'versionPath'
    });

    return Options;
});
