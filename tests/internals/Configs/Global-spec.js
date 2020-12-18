JARS.module('tests.internals.Configs.Global').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Global', function() {
        var GlobalConfig = InternalsRegistry.get('Configs/Global');

        it('should be an object', function() {
            expect(GlobalConfig).to.be.an('object');
        });
    });
});
