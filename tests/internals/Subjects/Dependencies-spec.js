JARS.module('tests.internals.Subjects.Dependencies').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Subjects/Dependencies/Module', function() {
        var Dependencies = InternalsRegistry.get('Subjects/Dependencies');

        describe('#add()', function() {
            it('should be a function', function() {
                expect(new Dependencies().add).to.be.a('function');
            });
        });

        describe('#getAll()', function() {
            it('should be a function', function() {
                expect(new Dependencies().getAll).to.be.a('function');
            });
        });
    });
});
