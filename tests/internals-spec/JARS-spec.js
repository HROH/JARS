JARS.module('internals-spec.JARS-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        GlobalConfig = InternalsRegistry.get('Configs/Global'),
        Injector = InternalsRegistry.get('Registries/Injector'),
        PathListResolver = InternalsRegistry.get('Resolvers/PathList');

    describe('JARS', function() {
        describe('.configure()', function() {
            it('should delegate to Configs/Global.update()', function() {
                var mockConfig = {};

                sinon.stub(GlobalConfig, 'update');

                JARS.configure(mockConfig);

                expect(GlobalConfig.update).to.have.been.calledWith(mockConfig);

                GlobalConfig.update.restore();
            });
        });

        describe('.flush()', function() {
            it('should delegate to Registries/Injector.flush()', function() {
                var context = 'test-flush';

                sinon.stub(Injector, 'flush');

                JARS.flush(context);

                expect(Injector.flush).to.have.been.calledWith(context);

                Injector.flush.restore();
            });
        });

        describe('.computeSortedPathList()', function() {
            it('should delegate to Resolvers/PathList.resolve()', function() {
                var entryModuleName = 'test-compute';

                function callback() {}

                sinon.stub(PathListResolver, 'resolve');

                JARS.computeSortedPathList(entryModuleName, callback);

                expect(PathListResolver.resolve).to.have.been.calledWith(entryModuleName, callback);

                PathListResolver.resolve.restore();
            });
        });

        describe('.module()', function() {
            it('should delegate to Registries/Injector.registerModule()', function() {
                var moduleName = 'test-register';

                sinon.stub(Injector, 'registerModule');

                JARS.module(moduleName);

                expect(Injector.registerModule).to.have.been.calledWith(moduleName);

                Injector.registerModule.restore();
            });

            it('should return a module API when given a modulename', function() {
                var module = JARS.module('a');

                expect(module).to.be.an('object');
                expect(module).to.have.property('meta').that.is.a('function');
                expect(module).to.have.property('$import').that.is.a('function');
                expect(module).to.have.property('$export').that.is.a('function');
            });
        });

        describe('.noConflict()', function() {
            var JARSreference;

            beforeEach(function() {
                JARSreference = JARS;
            });

            afterEach(function() {
                JARS = JARSreference;
            });

            it('should remove JARS from global space when called', function() {
                JARS.noConflict();

                expect(JARS).not.to.exist;
            });

            it('should return the global variable JARS', function() {
                expect(JARS.noConflict()).to.equal(JARSreference);
            });
        });
    });
});
