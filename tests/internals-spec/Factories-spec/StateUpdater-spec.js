JARS.module('internals-spec.Factories-spec.StateUpdater-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        StateUpdater = InternalsRegistry.get('State/Updater');

    describe('Factories/StateUpdater', function() {
        var StateUpdaterFactory = InternalsRegistry.get('Factories/StateUpdater');

        it('should return an instance of `State/Updater` when given a module injector', function() {
            expect(StateUpdaterFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(StateUpdater);
        });

        it('should return an instance of `State/Updater` when given a bundle injector', function() {
            expect(StateUpdaterFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(StateUpdater);
        });

        it('should return an instance of `State/Updater` when given an interception injector', function() {
            expect(StateUpdaterFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(StateUpdater);
        });
    });
});
