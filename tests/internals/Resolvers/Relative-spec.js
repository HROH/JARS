JARS.module('tests.internals.Resolvers.Relative').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Resolvers/Relative', function() {
        var RelativeResolver = InternalsRegistry.get('Resolvers/Relative');

        describe('.is()', function() {
            it('should identify a relative module name', function() {
                expect(RelativeResolver.is('.test')).to.equal(true);
            });
        });
    });
});
