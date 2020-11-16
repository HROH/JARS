JARS.module('internals-spec.Bootstrappers-spec.Modules-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Bootstrappers/Modules', function() {
        var ModulesBootstrapper = InternalsRegistry.get('Bootstrappers/Modules'),
            Injector = InternalsRegistry.get('Registries/Injector'),
            Tracker = InternalsRegistry.get('Helpers/Tracker');

        describe('.bootstrap()', function() {
            var testRoot = Injector.getSubject('testRoot');

            beforeEach(function() {
                sinon.stub(Injector, 'getRootModule').returns(testRoot);
                sinon.stub(testRoot, 'setMeta');
                sinon.stub(Tracker, 'setRoot');
            });

            afterEach(function() {
                Injector.getRootModule.restore();
                testRoot.setMeta.restore();
                Tracker.setRoot.restore();
            });

            it('should get the root module', function() {
                ModulesBootstrapper.bootstrap();

                expect(Injector.getRootModule).to.have.been.called;
            });

            it('should pass the root module to the tracker', function() {
                ModulesBootstrapper.bootstrap();

                expect(Tracker.setRoot).to.have.been.calledWith(testRoot);
            });

            it('should set the meta information on the root module', function() {
                ModulesBootstrapper.bootstrap();

                expect(testRoot.setMeta).to.have.been.called;
            });
        });
    });
});
