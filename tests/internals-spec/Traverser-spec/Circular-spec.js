JARS.module('internals-spec.Traverser-spec.Circular-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        SubjectsRegistry = InternalsRegistry.get('Registries/Subjects'),
        Result = InternalsRegistry.get('Traverser/Result');

    describe('Traverser/Circular', function() {
        var CircularTraverser = InternalsRegistry.get('Traverser/Circular');

        describe('.onEnter()', function() {
            describe('given a subject', function() {
                var subject = SubjectsRegistry.get('test-circular');

                describe('when it is waiting', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'isWaiting').returns(true);
                    });

                    afterEach(function() {
                        subject.state.isWaiting.restore();
                    });

                    describe('and equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should return `true` when the depth is 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.true;
                        });

                        it('should return `false` when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        });
                    });

                    describe('and does not equal the entry module', function() {
                        var entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        it('should return `true` for any depth', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.true;
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.true;
                        });
                    });
                });

                describe('when it is loading', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'isLoading').returns(true);
                    });

                    afterEach(function() {
                        subject.state.isLoading.restore();
                    });

                    it('should return `false` for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.false;
                    });
                });

                describe('when it is registered', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'isRegistered').returns(true);
                    });

                    afterEach(function() {
                        subject.state.isRegistered.restore();
                    });

                    describe('and equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should return `true` when the depth is 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.true;
                        });

                        it('should return `false` when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        });
                    });

                    describe('and does not equal the entry module', function() {
                        var entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        it('should return `true` for any depth', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.true;
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.true;
                        });
                    });
                });

                describe('when it is intercepted', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'isIntercepted').returns(true);
                    });

                    afterEach(function() {
                        subject.state.isIntercepted.restore();
                    });

                    describe('and equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should return `true` when the depth is 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.true;
                        });

                        it('should return `false` when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        });
                    });

                    describe('and does not equal the entry module', function() {
                        var entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        it('should return `true` for any depth', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.true;
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.true;
                        });
                    });
                });

                describe('when it is loaded', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'isLoaded').returns(true);
                    });

                    afterEach(function() {
                        subject.state.isLoaded.restore();
                    });

                    it('should return `false` for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.false;
                    });
                });

                describe('when it is aborted', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'isAborted').returns(true);
                    });

                    afterEach(function() {
                        subject.state.isAborted.restore();
                    });

                    it('should return `false` for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.false;
                    });
                });
            });
        });

        describe('.onLeave()', function() {
            describe('given a subject', function() {
                var subject = SubjectsRegistry.get('test-circular');

                describe('and given a starting list', function() {
                    var list = ['test'];

                    it('should prepend its name to the list for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = SubjectsRegistry.get('test-circular-entry'),
                            expected = new Result([subject.name].concat(list), true);

                        expect(CircularTraverser.onLeave(subject, entryModuleSame, 0, list)).to.deep.equal(expected);
                        expect(CircularTraverser.onLeave(subject, entryModuleSame, 4, list)).to.deep.equal(expected);
                        expect(CircularTraverser.onLeave(subject, entryModuleDifferent, 0, list)).to.deep.equal(expected);
                        expect(CircularTraverser.onLeave(subject, entryModuleDifferent, 4, list)).to.deep.equal(expected);
                    });
                });

                describe('and given no starting list', function() {
                    var list;

                    describe('when it equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should create no list when the depth is 0', function() {
                            expect(CircularTraverser.onLeave(subject, entryModuleSame, 0, list)).to.deep.equal(new Result(list));
                        });

                        it('should create a list when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onLeave(subject, entryModuleSame, 4, list)).to.deep.equal(new Result([subject.name], true));
                        });
                    });

                    describe('when it does not equal the entry module', function() {
                        var entryModuleDifferent = SubjectsRegistry.get('test-circular-entry');

                        it('should create no list for any depth', function() {
                            var expected = new Result(list);

                            expect(CircularTraverser.onLeave(subject, entryModuleDifferent, 0, list)).to.deep.equal(expected);
                            expect(CircularTraverser.onLeave(subject, entryModuleDifferent, 4, list)).to.deep.equal(expected);
                        });
                    });
                });
            });
        });
    });
});
