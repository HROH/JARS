JARS.module('tests.internals.Bootstrappers.Modules').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Bootstrappers/Modules', function() {
        var ModulesBootstrapper = InternalsRegistry.get('Bootstrappers/Modules'),
            SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
            Tracker = InternalsRegistry.get('Helpers/Tracker');

        describe('.bootstrap()', function() {
            var testRoot = SubjectsRegistry.getSubject('testRoot');

            beforeEach(function() {
                sinon.stub(SubjectsRegistry, 'getRootModule').returns(testRoot);
                sinon.stub(testRoot, 'setMeta');
                sinon.stub(Tracker, 'setRoot');
            });

            afterEach(function() {
                SubjectsRegistry.getRootModule.restore();
                testRoot.setMeta.restore();
                Tracker.setRoot.restore();
            });

            it('should get the root module', function() {
                ModulesBootstrapper.bootstrap();

                expect(SubjectsRegistry.getRootModule).to.have.been.called;
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
