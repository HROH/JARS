JARS.module('internals-spec.Configs-spec.Hooks-spec.Environment-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Configs/Hooks/Environment()', function() {
        var Environment = InternalsRegistry.get('Configs/Hooks/Environment');

        it('should return the given environment string', function() {
            expect(Environment(createGlobalConfigMock('testEnv'), 'testEnv')).to.equal('testEnv');
        });

        it('should update the global config when the environment changes', function() {
            var GlobalConfigMock = createGlobalConfigMock('otherEnv');

            Environment(GlobalConfigMock, 'testEnv');

            expect(GlobalConfigMock.update).to.have.been.calledWith(GlobalConfigMock.get('environments').testEnv);
        });

        it('should not update the global config when the environment is the same', function() {
            var GlobalConfigMock = createGlobalConfigMock('testEnv');

            Environment(GlobalConfigMock, 'testEnv');

            expect(GlobalConfigMock.update).to.not.have.been.called;
        });
    });

    function createGlobalConfigMock(currentEnvironment) {
        var get = sinon.stub(),
            environments = {
                testEnv: {}
            },
            GlobalConfigMock = {
                update: sinon.spy(),

                get: get
            };

        get.withArgs('environment').returns(currentEnvironment);
        get.withArgs('environments').returns(environments);

        return GlobalConfigMock;
    }
});
