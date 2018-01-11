JARS.internal('Types/Validator', function(getInternal) {
    'use strict';

    var TypeLookup = getInternal('Types/Lookup'),
        envGlobal = getInternal('Env').global,
        VALIDATOR_PREFIX = 'is',
        ARGUMENTS = 'Arguments';

    function Validator(Validators, typeDef) {
        var validatorName = VALIDATOR_PREFIX + typeDef,
            validator;

        if(!Validators[validatorName]) {
            validator = createValidator(validatorName, TypeLookup.add(typeDef), envGlobal[typeDef]);

            Validators[validatorName] = typeDef === ARGUMENTS ? function(value) {
                return value && (validator(value) || Validators.isArrayLike(value));
            } : validator;
        }


        return validatorName;
    }

    /**
     * @memberof JARS~internals.Types.Validator
     * @inner
     *
     * @param {string} validatorName
     * @param {string} type
     * @param {Object} globalType
     */
    function createValidator(validatorName, type, globalType) {
        return (globalType && globalType[validatorName]) || function validator(value) {
            return TypeLookup.get(value) === type;
        };
    }

    return Validator;
});
