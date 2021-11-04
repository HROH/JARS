JARS.module('tests.internals.Factories', [
    'CompletionHandler',
    'Config',
    'Dependencies',
    'Description',
    'Info',
    'Logger',
    'Options',
    'Parent',
    'ParentBundle',
    'ParentBundleName',
    'ParentName',
    'Ref',
    'State',
    'StateUpdater',
    'Strategy',
    'Subject'
]).$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        Injector = InternalsRegistry.get('Registries/Injector'),
        Factories;

    Factories = {
        createRootModuleInjector: function() {
            return new Injector(SubjectsRegistry, SubjectsRegistry.getRootModule().name, 'test-requestor');
        },

        createRootBundleInjector: function() {
            return new Injector(SubjectsRegistry, SubjectsRegistry.getRootBundle().name, 'test-requestor');
        },

        createModuleInjector: function() {
            return new Injector(SubjectsRegistry, 'test', 'test-requestor');
        },

        createBundleInjector: function() {
            return new Injector(SubjectsRegistry, 'test.*', 'test-requestor');
        },

        createInterceptionInjector: function() {
            return new Injector(SubjectsRegistry, 'test!', 'test-requestor');
        }
    };

    return Factories;
});
