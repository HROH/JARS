JARS.module('tests.internals.Types.Lookup').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Types/Lookup', function() {
        var TypeLookup = InternalsRegistry.get('Types/Lookup');

        describe('.get()', function() {
            it('should recognize null', function() {
                expect(TypeLookup.get(null)).to.equal('null');
            });

            it('should recognize undefined', function() {
                expect(TypeLookup.get()).to.equal('undefined');
            });

            it('should recognize a string', function() {
                expect(TypeLookup.get('')).to.equal('string');
                expect(TypeLookup.get(String(''))).to.equal('string');
            });

            it('should recognize a number', function() {
                expect(TypeLookup.get(0)).to.equal('number');
                expect(TypeLookup.get(Number(0))).to.equal('number');
            });

            it('should recognize NaN', function() {
                expect(TypeLookup.get(NaN)).to.equal('nan');
            });

            it('should recognize Infinity', function() {
                expect(TypeLookup.get(Infinity)).to.equal('infinity');
            });

            it('should recognize a boolean', function() {
                expect(TypeLookup.get(true)).to.equal('boolean');
                expect(TypeLookup.get(Boolean(true))).to.equal('boolean');
            });

            it('should recognize an array', function() {
                expect(TypeLookup.get([])).to.equal('array');
            });

            it('should recognize arguments', function() {
                expect(TypeLookup.get(arguments)).to.equal('arguments');
            });

            it('should recognize an object', function() {
                expect(TypeLookup.get({})).to.equal('object');
            });

            it('should recognize a function', function() {
                expect(TypeLookup.get(function() {})).to.equal('function');
            });

            it('should recognize a date', function() {
                expect(TypeLookup.get(new Date())).to.equal('date');
            });

            it('should recognize a regexp', function() {
                expect(TypeLookup.get(/some regexp/)).to.equal('regexp');
                expect(TypeLookup.get(new RegExp())).to.equal('regexp');
            });
        });

        describe('.each()', function() {
            it('should iterate over all types', function() {
                var callback = sinon.spy();

                TypeLookup.each(callback);

                expect(callback).to.have.callCount(11);
                expect(callback.args).to.deep.equal([
                    ['null', 'Null'],
                    ['undefined', 'Undefined'],
                    ['string', 'String'],
                    ['number', 'Number'],
                    ['boolean', 'Boolean'],
                    ['array', 'Array'],
                    ['arguments', 'Arguments'],
                    ['object', 'Object'],
                    ['function', 'Function'],
                    ['date', 'Date'],
                    ['regexp', 'RegExp']
                ]);
            });
        });
    });
});
