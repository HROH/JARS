JARS.module('tests.internals.Resolvers.Subjects.Module').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Resolvers/Subjects/Module', function() {
        var ModuleResolver = InternalsRegistry.get('Resolvers/Subjects/Module');

        describe('.isRoot()', function() {
            it('should return `true` when given a module name that is the root', function() {
                expect(ModuleResolver.isRoot(ModuleResolver.ROOT)).to.be.true;
            });

            it('should return `false` when given a module name that is not the root', function() {
                expect(ModuleResolver.isRoot('test')).to.be.false;
            });
        });

        describe('.getName()', function() {
            describe('given a module name', function() {
                var moduleName = 'test';

                describe('and given an empty child', function() {
                    var child = '';

                    describe('without version', function() {
                        it('should get the correct module name', function() {
                            expect(ModuleResolver.getName(moduleName, child)).to.equal('test');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should get the correct module name', function() {
                            expect(ModuleResolver.getName(moduleName + version, child)).to.equal('test' + version);
                        });
                    });
                });

                describe('and given a non-empty child', function() {
                    var child = 'child';

                    describe('without version', function() {
                        it('should get the correct module name', function() {
                            expect(ModuleResolver.getName(moduleName, child)).to.equal('test.child');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should get the correct module name', function() {
                            expect(ModuleResolver.getName(moduleName + version, child)).to.equal('test.child' + version);
                        });
                    });
                });
            });

            describe('given the root module name', function() {
                var moduleName = ModuleResolver.ROOT;

                describe('and given an empty child', function() {
                    var child = '';

                    it('should return an empty string', function() {
                        expect(ModuleResolver.getName(moduleName, child)).to.equal('');
                    });
                });

                describe('and given a non-empty child', function() {
                    var child = 'child';

                    it('should return the child module name', function() {
                        expect(ModuleResolver.getName(moduleName, child)).to.equal('child');
                    });
                });
            });
        });

        describe('.getParentName()', function() {
            describe('given a module name with parent', function() {
                var moduleName = 'test.child';

                describe('without version', function() {
                    it('should get the correct parent name', function() {
                        expect(ModuleResolver.getParentName(moduleName)).to.equal('test');
                    });
                });

                describe('with version', function() {
                    var version = '@1.0.0';

                    it('should get the correct parent name', function() {
                        expect(ModuleResolver.getParentName(moduleName + version)).to.equal('test' + version);
                    });
                });
            });

            describe('given a module name with no parent', function() {
                var moduleName = 'test';

                describe('without version', function() {
                    it('should get the correct parent name', function() {
                        expect(ModuleResolver.getParentName(moduleName)).to.equal(ModuleResolver.ROOT);
                    });
                });

                describe('with version', function() {
                    var version = '@1.0.0';

                    it('should get the correct parent name', function() {
                        expect(ModuleResolver.getParentName(moduleName + version)).to.equal(ModuleResolver.ROOT);
                    });
                });
            });
        });
    });
});
