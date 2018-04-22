JARS.module('internals-spec.Types-spec.Subject-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect;

    describe('Types/Subject', function() {
        var SubjectTypes = InternalsRegistry.get('Types/Subject');

        describe('.get()', function() {
            describe('should get the correct subject type', function() {
                it('for a module', function() {
                    expect(SubjectTypes.get('test')).to.equal('module');
                });

                it('for a bundle', function() {
                    expect(SubjectTypes.get('test.*')).to.equal('bundle');
                });

                it('for an interception', function() {
                    expect(SubjectTypes.get('test!')).to.equal('interception');
                });
            });
        });

        describe('.isBundle()', function() {
            describe('given a module', function() {
                var moduleName = 'test';

                describe('without an interception', function() {
                    describe('without a version', function() {
                        it('should fail', function() {
                            expect(SubjectTypes.isBundle(moduleName)).to.be.false;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should fail', function() {
                            expect(SubjectTypes.isBundle(moduleName + version)).to.be.false;
                        });
                    });
                });

                describe('with an interception', function() {
                    var interception = '!';

                    describe('without a version', function() {
                        it('should fail', function() {
                            expect(SubjectTypes.isBundle(moduleName + interception)).to.be.false;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should fail', function() {
                            expect(SubjectTypes.isBundle(moduleName + interception + version)).to.be.false;
                        });
                    });
                });
            });

            describe('given a bundle', function() {
                var bundleName = 'test.*';

                describe('without an interception', function() {
                    describe('without a version', function() {
                        it('should be recognized', function() {
                            expect(SubjectTypes.isBundle(bundleName)).to.be.true;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should be recognized', function() {
                            expect(SubjectTypes.isBundle(bundleName + version)).to.be.true;
                        });
                    });
                });

                describe('with an interception', function() {
                    var interception = '!';

                    describe('without a version', function() {
                        it('should fail', function() {
                            expect(SubjectTypes.isBundle(bundleName + interception)).to.be.false;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should fail', function() {
                            expect(SubjectTypes.isBundle(bundleName + interception + version)).to.be.false;
                        });
                    });
                });
            });
        });

        describe('.isInterception()', function() {
            describe('given a module', function() {
                var moduleName = 'test';

                describe('without an interception', function() {
                    describe('without a version', function() {
                        it('should fail', function() {
                            expect(SubjectTypes.isInterception(moduleName)).to.be.false;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should fail', function() {
                            expect(SubjectTypes.isInterception(moduleName + version)).to.be.false;
                        });
                    });
                });

                describe('with an interception', function() {
                    var interception = '!';

                    describe('without a version', function() {
                        it('should be recognized', function() {
                            expect(SubjectTypes.isInterception(moduleName + interception)).to.be.true;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should be recognized', function() {
                            expect(SubjectTypes.isInterception(moduleName + interception + version)).to.be.true;
                        });
                    });
                });
            });

            describe('given a bundle', function() {
                var bundleName = 'test.*';

                describe('without an interception', function() {
                    describe('without a version', function() {
                        it('should fail', function() {
                            expect(SubjectTypes.isInterception(bundleName)).to.be.false;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should fail', function() {
                            expect(SubjectTypes.isInterception(bundleName + version)).to.be.false;
                        });
                    });
                });

                describe('with an interception', function() {
                    var interception = '!';

                    describe('without a version', function() {
                        it('should be recognized', function() {
                            expect(SubjectTypes.isInterception(bundleName + interception)).to.be.true;
                        });
                    });

                    describe('with a version', function() {
                        var version = '@1.0.0';

                        it('should be recognized', function() {
                            expect(SubjectTypes.isInterception(bundleName + interception + version)).to.be.true;
                        });
                    });
                });
            });
        });
    });
});
