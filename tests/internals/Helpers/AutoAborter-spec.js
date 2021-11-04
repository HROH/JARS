JARS.module('tests.internals.Helpers.AutoAborter').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        PathResolver = InternalsRegistry.get('Resolvers/Path');

    describe('Helpers/AutoAborter', function() {
        var AutoAborter = InternalsRegistry.get('Helpers/AutoAborter');

        describe('.setup()', function() {
            it('should call stateUpdater.update() on the module after the timeout', function() {
                var mockModule = createMockModuleWithTimeout('test-abort'),
                    clock = sinon.useFakeTimers();

                AutoAborter.setup(mockModule, PathResolver(mockModule));

                expect(mockModule.stateUpdater.update).to.not.have.been.called;
                clock.tick(1000);
                expect(mockModule.stateUpdater.update).to.have.been.calledWith('aborted', 'timeout after ${sec} second(s) with given path "${path}"', {
                    path: PathResolver(mockModule),

                    sec: 1
                });

                clock.restore();
            });
        });

        describe('.clear()', function() {
            it('should not call stateUpdater.update() when the timeout is canceled', function() {
                var mockModule = createMockModuleWithTimeout('test-clear'),
                    clock = sinon.useFakeTimers();

                AutoAborter.setup(mockModule, PathResolver(mockModule));
                AutoAborter.clear(mockModule);

                clock.tick(1000);
                expect(mockModule.stateUpdater.update).to.not.have.been.called;

                clock.restore();
            });
        });
    });

    function createMockModuleWithTimeout(moduleName) {
        var mockModule = SubjectsRegistry.getSubject(moduleName);

        mockModule.config.update({
            timeout: 1
        });
        sinon.stub(mockModule.stateUpdater, 'update');

        return mockModule;
    }
});
