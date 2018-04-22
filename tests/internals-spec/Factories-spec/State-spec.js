JARS.module('internals-spec.Factories-spec.State-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Helpers/Injector'),
        State = InternalsRegistry.get('States/Subject');

    describe('Factories/State', function() {
        var StateFactory = InternalsRegistry.get('Factories/State');

        it('should return an instance of `States/Subject` when given a module injector', function() {
            expect(StateFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(State);
        });

        it('should return an instance of `States/Subject` when given a bundle injector', function() {
            expect(StateFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(State);
        });

        it('should return an instance of `States/Subject` when given an interception injector', function() {
            expect(StateFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(State);
        });
    });
});
