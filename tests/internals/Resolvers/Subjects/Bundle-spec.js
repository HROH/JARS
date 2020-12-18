JARS.module('tests.internals.Resolvers.Subjects.Bundle').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Resolvers/Subjects/Bundle', function() {
        var BundleResolver = InternalsRegistry.get('Resolvers/Subjects/Bundle');

        describe('.getName()', function() {
            describe('given an empty string', function() {
                var empty = '';

                it('should always return an empty string ignoring any interception and version', function() {
                    expect(BundleResolver.getName(empty)).to.equal('');
                    expect(BundleResolver.getName(empty + '@1.0.0')).to.equal('');
                    expect(BundleResolver.getName(empty + '!')).to.equal('');
                    expect(BundleResolver.getName(empty + '!@1.0.0')).to.equal('');
                });
            });

            describe('given a bundle name', function() {
                var bundleName = 'test.*';

                describe('without interception', function() {
                    describe('without version', function() {
                        it('should return the bundle name', function() {
                            expect(BundleResolver.getName(bundleName)).to.equal('test.*');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the bundle name with version', function() {
                            expect(BundleResolver.getName(bundleName + version)).to.equal('test.*@1.0.0');
                        });
                    });
                });

                describe('with interception', function() {
                    var interception = '!';

                    describe('without version', function() {
                        it('should return the bundle name with interception', function() {
                            expect(BundleResolver.getName(bundleName + interception)).to.equal('test.*!');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the bundle name with interception and version', function() {
                            expect(BundleResolver.getName(bundleName + interception + version)).to.equal('test.*!@1.0.0');
                        });
                    });
                });
            });

            describe('given a module name', function() {
                var moduleName = 'test';

                describe('without interception', function() {
                    describe('without version', function() {
                        it('should return the bundle name', function() {
                            expect(BundleResolver.getName(moduleName)).to.equal('test.*');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the bundle name with version', function() {
                            expect(BundleResolver.getName(moduleName + version)).to.equal('test.*@1.0.0');
                        });
                    });
                });

                describe('with interception', function() {
                    var interception = '!';

                    describe('without version', function() {
                        it('should return the bundle name with interception', function() {
                            expect(BundleResolver.getName(moduleName + interception)).to.equal('test.*!');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the bundle name with interception and version', function() {
                            expect(BundleResolver.getName(moduleName + interception + version)).to.equal('test.*!@1.0.0');
                        });
                    });
                });
            });
        });

        describe('.getParentName()', function() {
            describe('given an empty string', function() {
                var empty = '';

                it('should always return an empty string ignoring any interception and version', function() {
                    expect(BundleResolver.getParentName(empty)).to.equal('');
                    expect(BundleResolver.getParentName(empty + '@1.0.0')).to.equal('');
                    expect(BundleResolver.getParentName(empty + '!')).to.equal('');
                    expect(BundleResolver.getParentName(empty + '!@1.0.0')).to.equal('');
                });
            });

            describe('given a bundle name', function() {
                var bundleName = 'test.*';

                describe('without interception', function() {
                    describe('without version', function() {
                        it('should return the correct module name', function() {
                            expect(BundleResolver.getParentName(bundleName)).to.equal('test');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the correct module name', function() {
                            expect(BundleResolver.getParentName(bundleName + version)).to.equal('test@1.0.0');
                        });
                    });
                });

                describe('with interception', function() {
                    var interception = '!';

                    describe('without version', function() {
                        it('should return the correct module name with interception', function() {
                            expect(BundleResolver.getParentName(bundleName + interception)).to.equal('test!');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the correct module name with interception', function() {
                            expect(BundleResolver.getParentName(bundleName + interception + version)).to.equal('test!@1.0.0');
                        });
                    });
                });
            });

            describe('given a module name', function() {
                var moduleName = 'test';

                describe('without interception', function() {
                    describe('without version', function() {
                        it('should return the module name itself', function() {
                            expect(BundleResolver.getParentName(moduleName)).to.equal('test');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the module name itself', function() {
                            expect(BundleResolver.getParentName(moduleName + version)).to.equal('test@1.0.0');
                        });
                    });
                });

                describe('with interception', function() {
                    var interception = '!';

                    describe('without version', function() {
                        it('should return the module name with interception', function() {
                            expect(BundleResolver.getParentName(moduleName + interception)).to.equal('test!');
                        });
                    });

                    describe('with version', function() {
                        var version = '@1.0.0';

                        it('should return the module name with interception', function() {
                            expect(BundleResolver.getParentName(moduleName + interception + version)).to.equal('test!@1.0.0');
                        });
                    });
                });
            });
        });
    });
});
