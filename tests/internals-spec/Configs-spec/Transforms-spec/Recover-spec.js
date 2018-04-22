JARS.module('internals-spec.Configs-spec.Transforms-spec.Recover-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Recover()', function() {
        var RecoverTransform = InternalsRegistry.get('Configs/Transforms/Recover');

        it('should return the given config with the recover option set to `null` when not defined', function() {
            expect(RecoverTransform({
                some: 'option'
            })).to.deep.equal({
                some: 'option',

                recover: null
            });
        });

        it('should return the given config with the recover option preserved when defined', function() {
            expect(RecoverTransform({
                some: 'option',

                recover: {
                    another: 'option'
                }
            })).to.deep.equal({
                some: 'option',

                recover: {
                    another: 'option'
                }
            });
        });
    });
});
