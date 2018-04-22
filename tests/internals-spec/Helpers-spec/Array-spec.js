JARS.module('internals-spec.Helpers-spec.Array-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Helpers/Array', function() {
        var ArrayHelper = InternalsRegistry.get('Helpers/Array');

        describe('.each()', function() {
            it('should iterate over an array', function() {
                var actual = [];

                ArrayHelper.each(['a', 'b', 'c', 'd'], function(value) {
                    actual.push(value);
                });

                expect(actual).to.deep.equal(['a', 'b', 'c', 'd']);
            });

            it('should return early when `true` is returned by the function', function() {
                var actual = [];

                ArrayHelper.each(['a', 'b', 'c', 'd'], function(value) {
                    actual.push(value);

                    return true;
                });

                expect(actual).to.deep.equal(['a']);
            });

            it('should pass index as second argument', function() {
                var actual = [];

                ArrayHelper.each(['a', 'b', 'c', 'd'], function(value, index) {
                    actual.push(index);
                });

                expect(actual).to.deep.equal([0, 1, 2, 3]);
            });
        });
    });
});
