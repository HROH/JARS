JARS.module('tests.internals.Configs.Subject').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Options = InternalsRegistry.get('Configs/Options');

    describe('Configs/Subject', function() {
        var Config = InternalsRegistry.get('Configs/Subject');

        describe('#get()', function() {
            it('should be a function', function() {
                expect(new Config('test').get).to.be.a('function');
            });
        });

        describe('#update()', function() {
            it('should be a function', function() {
                expect(new Config('test', new Options()).update).to.be.a('function');
            });
        });
    });
});
