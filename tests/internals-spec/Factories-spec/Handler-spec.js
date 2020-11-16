JARS.module('internals-spec.Factories-spec.Handler-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        ModuleCompletionHandler = InternalsRegistry.get('Handlers/Completion/Module'),
        BundleCompletionHandler = InternalsRegistry.get('Handlers/Completion/Bundle'),
        InterceptionCompletionHandler = InternalsRegistry.get('Handlers/Completion/Interception');

    describe('Factories/Handler', function() {
        var HandlerFactory = InternalsRegistry.get('Factories/Handler');

        it('should return an instance of `Handlers/Completion/Module` when given a module', function() {
            expect(HandlerFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(ModuleCompletionHandler);
        });

        it('should return an instance of `Handlers/Completion/Bundle` when given a bundle', function() {
            expect(HandlerFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(BundleCompletionHandler);
        });

        it('should return an instance of `Handlers/Completion/Interception` when given an interception', function() {
            expect(HandlerFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(InterceptionCompletionHandler);
        });
    });
});
