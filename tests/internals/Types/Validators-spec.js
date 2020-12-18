JARS.module('tests.internals.Types.Validators').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Types/Validators', function() {
        var TypeValidators = InternalsRegistry.get('Types/Validators');

        describe('.isNull()', function() {
            it('should positively validate `null`', function() {
                expect(TypeValidators.isNull(null)).to.be.true;
            });
        });

        describe('.isUndefined()', function() {
            it('should positively validate `undefined`', function() {
                expect(TypeValidators.isUndefined()).to.be.true;
            });
        });

        describe('.isDefined()', function() {
            it('should negatively validate `undefined`', function() {
                expect(TypeValidators.isDefined()).to.be.false;
            });
        });

        describe('.isNil()', function() {
            it('should positively validate `undefined`', function() {
                expect(TypeValidators.isNil()).to.be.true;
            });

            it('should positively validate `null`', function() {
                expect(TypeValidators.isNil(null)).to.be.true;
            });
        });

        describe('.isString()', function() {
            it('should positively validate a string', function() {
                expect(TypeValidators.isString('')).to.be.true;
            });
        });

        describe('.isNumber()', function() {
            it('should positively validate a number', function() {
                expect(TypeValidators.isNumber(0)).to.be.true;
            });
        });

        describe('.isInteger()', function() {
            it('should positively validate an integer', function() {
                expect(TypeValidators.isInteger(0)).to.be.true;
            });

            it('should negatively validate a float', function() {
                expect(TypeValidators.isInteger(0.5)).to.be.false;
            });
        });

        describe('.isFinite()', function() {
            it('should positively validate a finite number', function() {
                expect(TypeValidators.isFinite(1)).to.be.true;
            });

            it('should negatively validate a `Infinity`', function() {
                expect(TypeValidators.isFinite(Infinity)).to.be.false;
            });
        });

        describe('.isNaN()', function() {
            it('should positively validate `NaN`', function() {
                expect(TypeValidators.isNaN(NaN)).to.be.true;
            });

            it('should negatively validate a number', function() {
                expect(TypeValidators.isNaN(0)).to.be.false;
            });
        });

        describe('.isBoolean()', function() {
            it('should positively validate a boolean', function() {
                expect(TypeValidators.isBoolean(false)).to.be.true;
            });
        });

        describe('.isArray()', function() {
            it('should positively validate an array', function() {
                expect(TypeValidators.isArray([])).to.be.true;
            });
        });

        describe('.isArrayLike()', function() {
            it('should positively validate an array', function() {
                expect(TypeValidators.isArrayLike([])).to.be.true;
            });

            it('should positively validate a `arguments`', function() {
                expect(TypeValidators.isArrayLike(arguments)).to.be.true;
            });

            it('should positively validate an arraylike object', function() {
                expect(TypeValidators.isArrayLike({
                    0: 'a',
                    1: 'b',
                    length: 2
                })).to.be.true;
            });
        });

        describe('.isArguments()', function() {
            it('should positively validate `arguments`', function() {
                expect(TypeValidators.isArguments(arguments)).to.be.true;
            });
        });

        describe('.isObject()', function() {
            it('should positively validate an object', function() {
                expect(TypeValidators.isObject({})).to.be.true;
            });
        });

        describe('.isFunction()', function() {
            it('should positively validate a function', function() {
                expect(TypeValidators.isFunction(function() {})).to.be.true;
            });
        });

        describe('.isDate()', function() {
            it('should positively validate a date', function() {
                expect(TypeValidators.isDate(new Date())).to.be.true;
            });
        });

        describe('.isRegexp()', function() {
            it('should positively validate a regexp', function() {
                expect(TypeValidators.isRegExp(/some regexp/)).to.be.true;
            });
        });

        describe('.isA()', function() {
            it('should positively validate an instance', function() {
                expect(TypeValidators.isA(/some regexp/, RegExp)).to.be.true;
            });

            it('should negatively validate an instance', function() {
                expect(TypeValidators.isA(/some regexp/, Array)).to.be.false;
            });
        });
    });
});
