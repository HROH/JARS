JARS.module('tests.internals.Configs.Transforms.Config').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Config()', function() {
        var ConfigTransform = InternalsRegistry.get('Configs/Transforms/Config');

        it('should merge the new config with the old config', function() {
            expect(ConfigTransform({
                newValue: 'new'
            }, {
                oldValue: 'old'
            })).to.deep.equal({
                oldValue: 'old',

                newValue: 'new'
            });
        });
    });
});
