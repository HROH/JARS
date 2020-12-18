JARS.module('tests.internals.Resolvers.Subjects.Interception').$import('*!Registries/Internals').$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Resolvers/Subjects/Interception', function() {
        var InterceptionResolver = InternalsRegistry.get('Resolvers/Subjects/Interception');

        describe('.getName()', function() {
            describe('given an empty string', function() {
                var empty = '';

                describe('without interception info', function() {
                    describe('without interception', function() {
                        describe('without version', function() {
                            it('should return an empty string', function() {
                                expect(InterceptionResolver.getName(empty)).to.equal('');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return an empty string', function() {
                                expect(InterceptionResolver.getName(empty + version)).to.equal('');
                            });
                        });
                    });

                    describe('with interception', function() {
                        var interception = '!';

                        describe('without version', function() {
                            it('should return an empty interception', function() {
                                expect(InterceptionResolver.getName(empty + interception)).to.equal('!');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return an empty interception with version', function() {
                                expect(InterceptionResolver.getName(empty + interception + version)).to.equal('!@1.0.0');
                            });
                        });
                    });
                });

                describe('with interception info', function() {
                    var info = {
                        type: '::',
                        data: 'any'
                    };

                    describe('without interception', function() {
                        describe('without version', function() {
                            it('should return an empty string', function() {
                                expect(InterceptionResolver.getName(empty, info)).to.equal('');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return an empty string', function() {
                                expect(InterceptionResolver.getName(empty + version, info)).to.equal('');
                            });
                        });
                    });

                    describe('with interception', function() {
                        var interception = '!';

                        describe('without version', function() {
                            it('should return two empty interceptions', function() {
                                expect(InterceptionResolver.getName(empty + interception, info)).to.equal('!::any');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return two empty interceptions with version', function() {
                                expect(InterceptionResolver.getName(empty + interception + version, info)).to.equal('!::any@1.0.0');
                            });
                        });
                    });
                });
            });

            describe('given a bundle name', function() {
                var bundleName = 'test.*';

                describe('without interception info', function() {
                    describe('without interception', function() {
                        describe('without version', function() {
                            it('should return the bundle name', function() {
                                expect(InterceptionResolver.getName(bundleName)).to.equal('test.*');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the bundle name with version', function() {
                                expect(InterceptionResolver.getName(bundleName + version)).to.equal('test.*@1.0.0');
                            });
                        });
                    });

                    describe('with interception', function() {
                        var interception = '!';

                        describe('without version', function() {
                            it('should return the bundle name with interception', function() {
                                expect(InterceptionResolver.getName(bundleName + interception)).to.equal('test.*!');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the bundle name with interception and version', function() {
                                expect(InterceptionResolver.getName(bundleName + interception + version)).to.equal('test.*!@1.0.0');
                            });
                        });
                    });
                });

                describe('with interception info', function() {
                    var info = {
                        type: '::',
                        data: 'any'
                    };

                    describe('without interception', function() {
                        describe('without version', function() {
                            it('should return the bundle name with interception', function() {
                                expect(InterceptionResolver.getName(bundleName, info)).to.equal('test.*::any');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the bundle name with interception and version', function() {
                                expect(InterceptionResolver.getName(bundleName + version, info)).to.equal('test.*::any@1.0.0');
                            });
                        });
                    });

                    describe('with interception', function() {
                        var interception = '!';

                        describe('without version', function() {
                            it('should return the bundle name with two interceptions and version', function() {
                                expect(InterceptionResolver.getName(bundleName + interception, info)).to.equal('test.*!::any');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the bundle name with two interceptions and version', function() {
                                expect(InterceptionResolver.getName(bundleName + interception + version, info)).to.equal('test.*!::any@1.0.0');
                            });
                        });
                    });
                });
            });

            describe('given a module name', function() {
                var moduleName = 'test';

                describe('without interception info', function() {
                    describe('without interception', function() {
                        describe('without version', function() {
                            it('should return the module name', function() {
                                expect(InterceptionResolver.getName(moduleName)).to.equal('test');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the module name with version', function() {
                                expect(InterceptionResolver.getName(moduleName + version)).to.equal('test@1.0.0');
                            });
                        });
                    });

                    describe('with interception', function() {
                        var interception = '!';

                        describe('without version', function() {
                            it('should return the module name with interception', function() {
                                expect(InterceptionResolver.getName(moduleName + interception)).to.equal('test!');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the module name with interception and version', function() {
                                expect(InterceptionResolver.getName(moduleName + interception + version)).to.equal('test!@1.0.0');
                            });
                        });
                    });
                });

                describe('with interception info', function() {
                    var info = {
                        type: '::',
                        data: 'any'
                    };

                    describe('without interception', function() {
                        describe('without version', function() {
                            it('should return the module name with interception', function() {
                                expect(InterceptionResolver.getName(moduleName, info)).to.equal('test::any');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the module name with interception and version', function() {
                                expect(InterceptionResolver.getName(moduleName + version, info)).to.equal('test::any@1.0.0');
                            });
                        });
                    });

                    describe('with interception', function() {
                        var interception = '!';

                        describe('without version', function() {
                            it('should return the module name with two interceptions', function() {
                                expect(InterceptionResolver.getName(moduleName + interception, info)).to.equal('test!::any');
                            });
                        });

                        describe('with version', function() {
                            var version = '@1.0.0';

                            it('should return the module name with two interceptions and version', function() {
                                expect(InterceptionResolver.getName(moduleName + interception + version, info)).to.equal('test!::any@1.0.0');
                            });
                        });
                    });
                });
            });
        });

        describe('.getParentName()', function() {
            describe('given a module name with interception', function() {
                var interceptionName = 'test!';

                describe('without a version', function() {
                    it('should return the module name', function() {
                        expect(InterceptionResolver.getParentName(interceptionName)).to.equal('test');
                    });
                });

                describe('with a version', function() {
                    var version = '@1.0.0';

                    it('should return the module name', function() {
                        expect(InterceptionResolver.getParentName(interceptionName + version)).to.equal('test' + version);
                    });
                });
            });

            describe('given a bundle name with interception', function() {
                var interceptionName = 'test.*!';

                describe('without a version', function() {
                    it('should return the module name', function() {
                        expect(InterceptionResolver.getParentName(interceptionName)).to.equal('test.*');
                    });
                });

                describe('with a version', function() {
                    var version = '@1.0.0';

                    it('should return the module name', function() {
                        expect(InterceptionResolver.getParentName(interceptionName + version)).to.equal('test.*' + version);
                    });
                });
            });
        });
    });
});
