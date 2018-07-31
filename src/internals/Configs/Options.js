JARS.internal('Configs/Options', function(getInternal) {
    'use strict';

    var PublicConfig = getInternal('Configs/Public'),
        OptionsResolver = getInternal('Resolvers/Options'),
        Transforms = getInternal('Configs/Transforms'),
        ObjectHelper = getInternal('Helpers/Object'),
        isBundle = getInternal('Types/Subject').isBundle,
        isNull = getInternal('Types/Validators').isNull;

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
        var defaultOptions = new Options();

        isBundle(subjectName) || Options.transformAndUpdate(defaultOptions, OptionsResolver(subjectName), subjectName);

        return defaultOptions;
    };

    /**
     * @param {JARS~internals.Configs.Options} options
     * @param {Object} newOptions
     * @param {string} subjectName
     */
    Options.transformAndUpdate = function(options, newOptions, subjectName) {
        ObjectHelper.each(newOptions, function updateConfig(value, option) {
            if (ObjectHelper.hasOwnProp(Transforms, option)) {
                updateOption(options, option, transformOption(option, value, options[option], subjectName));
            }
        });
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

    /**
     * @memberof JARS~internals.Configs.Options
     * @inner
     *
     * @param {string} option
     * @param {*} value
     * @param {*} oldValue
     * @param {string} subjectName
     *
     * @return {*}
     */
    function transformOption(option, value, oldValue, subjectName) {
        return Transforms[option](value, oldValue, subjectName);
    }

    /**
     * @memberof JARS~internals.Configs.Options
     * @inner
     *
     * @param {JARS~internals.Configs.Options} options
     * @param {string} option
     * @param {*} value
     */
    function updateOption(options, option, value) {
        if (isNull(value)) {
            delete options[option];
        }
        else {
            options[option] = value;
        }
    }

    return Options;
});
