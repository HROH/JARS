JARS.module('internals-spec.Strategies-spec.Resolution-spec.Subject-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects');

    describe('Strategies/Resolution/Subject()', function() {
        var SubjectResolutionStrategy = InternalsRegistry.get('Strategies/Resolution/Subject');

        describe('given the root module', function() {
            var testModule = SubjectsRegistry.getRootModule();

            it('should resolve an absolute dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, 'dependency')).to.deep.equal({
                    name: 'dependency'
                });
            });

            it('should resolve an absolute versioned dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, 'dependency@1.0.0')).to.deep.equal({
                    name: 'dependency@1.0.0'
                });
            });

            it('should fail to resolve an out of scope relative dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '.dependency')).to.deep.equal({
                    error: 'a module can not be resolved beyond the root'
                });
            });

            it('should fail to resolve an empty dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '')).to.deep.equal({
                    error: 'a dependency module must be absolute or relative to the base module'
                });
            });
        });

        describe('given a not versioned module', function() {
            var testModule = SubjectsRegistry.get('test.child');

            it('should resolve an absolute dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, 'dependency')).to.deep.equal({
                    name: 'dependency'
                });
            });

            it('should resolve an absolute versioned dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, 'dependency@1.0.0')).to.deep.equal({
                    name: 'dependency@1.0.0'
                });
            });

            it('should resolve a relative dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '.dependency')).to.deep.equal({
                    name: 'test.dependency'
                });
            });

            it('should fail to resolve an out of scope relative dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '..dependency')).to.deep.equal({
                    error: 'a module can not be resolved beyond the root'
                });
            });

            it('should fail to resolve a relative versioned dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '.dependency@1.0.0')).to.deep.equal({
                    error: 'a version must only be added to the base module'
                });
            });

            it('should fail to resolve an empty dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '')).to.deep.equal({
                    error: 'a dependency module must be absolute or relative to the base module'
                });
            });
        });

        describe('given a versioned module', function() {
            var testModule = SubjectsRegistry.get('test.child@1.0.0');

            it('should resolve an absolute dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, 'dependency')).to.deep.equal({
                    name: 'dependency'
                });
            });

            it('should resolve an absolute versioned dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, 'dependency@1.0.0')).to.deep.equal({
                    name: 'dependency@1.0.0'
                });
            });

            it('should resolve a relative dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '.dependency')).to.deep.equal({
                    name: 'test.dependency@1.0.0'
                });
            });

            it('should fail to resolve an out of scope relative dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '..dependency')).to.deep.equal({
                    error: 'a module can not be resolved beyond the root'
                });
            });

            it('should fail to resolve a relative versioned dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '.dependency@1.0.0')).to.deep.equal({
                    error: 'a version must only be added to the base module'
                });
            });

            it('should fail to resolve an empty dependency module', function() {
                expect(SubjectResolutionStrategy(testModule, '')).to.deep.equal({
                    error: 'a dependency module must be absolute or relative to the base module'
                });
            });
        });
    });
});
