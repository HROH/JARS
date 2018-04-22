JARS.module('internals-spec.Helpers-spec.Object-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Helpers/Object', function() {
        var ObjectHelper = InternalsRegistry.get('Helpers/Object');

        describe('.hasOwnProp()', function() {
            it('should identify a property as own', function() {
                expect(ObjectHelper.hasOwnProp(createMockObjectWithOwn(), 'foo')).to.be.true;
            });

            it('should identify an inherited property as not own', function() {
                expect(ObjectHelper.hasOwnProp(createMockObjectWithNotOwn(), 'bar')).to.be.false;
            });
        });

        describe('.each()', function() {
            it('should iterate over an object', function() {
                var actual = [];

                ObjectHelper.each(createMockObjectWithOwn(), function(value) {
                    actual.push(value);
                });

                expect(actual).to.deep.equal(['a', 'b']);
            });

            it('should only iterate over own properties ', function() {
                var actual = [];

                ObjectHelper.each(createMockObjectWithNotOwn(), function(value) {
                    actual.push(value);
                });

                expect(actual).to.deep.equal(['a']);
            });

            it('should return early when `true` is returned by the function', function() {
                var actual = [];

                ObjectHelper.each(createMockObjectWithOwn(), function(value) {
                    actual.push(value);

                    return true;
                });

                expect(actual).to.deep.equal(['a']);
            });

            it('should pass key as second argument', function() {
                var actual = [];

                ObjectHelper.each(createMockObjectWithOwn(), function(value, key) {
                    actual.push(key);
                });

                expect(actual).to.deep.equal(['foo', 'bar']);
            });
        });

        describe('.merge()', function() {
            it('should merge one object into the other', function() {
                expect(ObjectHelper.merge(createMockObjectWithOwn(), {
                    baz: 'c'
                })).to.deep.equal({
                    foo: 'a',
                    bar: 'b',
                    baz: 'c'
                });
            });

            it('should overwrite existing properties', function() {
                expect(ObjectHelper.merge(createMockObjectWithOwn(), {
                    foo: 'd'
                })).to.deep.equal({
                    foo: 'd',
                    bar: 'b'
                });
            });
        });

        function createMockObjectWithOwn() {
            return {
                foo: 'a',
                bar: 'b'
            };
        }

        function createMockObjectWithNotOwn() {
            function Mock() {
                this.foo = 'a';
            }

            Mock.prototype.bar = 'b';

            return new Mock();
        }
    });
});
