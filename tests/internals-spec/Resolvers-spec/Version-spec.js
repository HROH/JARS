JARS.module('internals-spec.Resolvers-spec.Version-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        VersionResolver = InternalsRegistry.get('Resolvers/Version');

    describe('Resolvers/Version', function() {
        describe('.getVersion()', function() {
            it('should get the correct version from a module name', function() {
                expect(VersionResolver.getVersion('test.child@1.0.0')).to.equal('1.0.0');
            });
        });

        describe('removeVersion()', function() {
            it('should correctly remove version from a module name', function() {
                expect(VersionResolver.removeVersion('test.child@1.0.0')).to.equal('test.child');
            });
        });

        describe('unwrapVersion()', function() {
            it('should make it possible to change the module name but keep the version', function() {
                var addGrandChild = VersionResolver.unwrapVersion(function(moduleName) {
                    return moduleName + '.grandchild';
                });

                expect(addGrandChild('test.child@1.0.0')).to.equal('test.child.grandchild@1.0.0');
            });
        });
    });
});
