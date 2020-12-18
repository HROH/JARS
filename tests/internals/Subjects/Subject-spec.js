JARS.module('tests.internals.Subjects.Subject').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Subjects/Subject', function() {
        var Subject = InternalsRegistry.get('Subjects/Subject');

        it('should be a function', function() {
            expect(Subject).to.be.a('function');
        });
    });
});
