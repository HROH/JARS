JARS.module('tests.internals.Strategies.Type.Undefined').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Strategies/Type/Undefined()', function() {
        var UndefinedStrategy = InternalsRegistry.get('Strategies/Type/Undefined');

        it('should be a function', function() {
            expect(UndefinedStrategy).to.be.a('function');
        });

        it('should return an empty array', function() {
            var actual = UndefinedStrategy();

            expect(actual).to.be.an('array');
            expect(actual).to.be.empty;
        });
    });
});
