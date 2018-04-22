JARS.module('internals-spec.Bootstrappers-spec.Configs-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Bootstrappers/Configs', function() {
        var ConfigsBootstrapper = InternalsRegistry.get('Bootstrappers/Configs'),
            GlobalConfig = InternalsRegistry.get('Configs/Global');

        describe('.bootstrap()', function() {
            it('should update the global config', function() {
                sinon.stub(GlobalConfig, 'update');

                ConfigsBootstrapper.bootstrap();
                expect(GlobalConfig.update).to.have.been.called;

                GlobalConfig.update.restore();
            });
        });
    });
});
