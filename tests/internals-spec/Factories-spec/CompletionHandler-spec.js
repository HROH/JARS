JARS.module('internals-spec.Factories-spec.CompletionHandler-spec').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        ModuleCompletionHandler = InternalsRegistry.get('Handlers/Completion/Module'),
        BundleCompletionHandler = InternalsRegistry.get('Handlers/Completion/Bundle'),
        InterceptionCompletionHandler = InternalsRegistry.get('Handlers/Completion/Interception');

    describe('Factories/Handler', function() {
        var CompletionHandlerFactory = InternalsRegistry.get('Factories/CompletionHandler');

        it('should return an instance of `Handlers/Completion/Module` when given a module', function() {
            expect(CompletionHandlerFactory(new Injector('test', 'test-requestor'))).to.be.an.instanceof(ModuleCompletionHandler);
        });

        it('should return an instance of `Handlers/Completion/Bundle` when given a bundle', function() {
            expect(CompletionHandlerFactory(new Injector('test.*', 'test-requestor'))).to.be.an.instanceof(BundleCompletionHandler);
        });

        it('should return an instance of `Handlers/Completion/Interception` when given an interception', function() {
            expect(CompletionHandlerFactory(new Injector('test!', 'test-requestor'))).to.be.an.instanceof(InterceptionCompletionHandler);
        });
    });
});
