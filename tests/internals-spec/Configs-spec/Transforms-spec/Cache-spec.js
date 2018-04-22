JARS.module('internals-spec.Configs-spec.Transforms-spec.Cache-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Transforms/Cache()', function() {
        var CacheTransform = InternalsRegistry.get('Configs/Transforms/Cache');

        it('should return an empty string when given a truthy argument', function() {
            expect(CacheTransform(true)).to.equal('');
        });

        it('should return a cache invalidation string with the current time when given a falsy argument', function() {
            var clock = sinon.useFakeTimers({
                toFake: ['Date']
            });

            expect(CacheTransform()).to.equal('?_=' + new Date().getTime());

            clock.restore();
        });
    });
});
