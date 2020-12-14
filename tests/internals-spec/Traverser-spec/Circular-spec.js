JARS.module('internals-spec.Traverser-spec.Circular-spec').$import(['*!Registries/Internals']).$export(function(InternalsRegistry) {
    'use strict';

    var expect = chai.expect,
        Injector = InternalsRegistry.get('Registries/Injector'),
        Result = InternalsRegistry.get('Traverser/Result'),
        States = InternalsRegistry.get('State/States');

    describe('Traverser/Circular', function() {
        var CircularTraverser = InternalsRegistry.get('Traverser/Circular');

        describe('.onEnter()', function() {
            describe('given a subject', function() {
                var subject = Injector.getSubject('test-circular');

                describe('when it is waiting', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'is').returns(false).withArgs(States.WAITING).returns(true);
                    });

                    afterEach(function() {
                        subject.state.is.restore();
                    });

                    it('should bail for any depth', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = Injector.getSubject('test-circular-entry');

                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.false;
                    });
                });

                describe('when it is loading', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'is').returns(false).withArgs(States.LOADING).returns(true);
                    });

                    afterEach(function() {
                        subject.state.is.restore();
                    });

                    it('should bail for any depth', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = Injector.getSubject('test-circular-entry');

                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.false;
                    });
                });

                describe('when it is registered', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'is').returns(false).withArgs(States.REGISTERED).returns(true);
                    });

                    afterEach(function() {
                        subject.state.is.restore();
                    });

                    describe('and equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should not bail when the depth is 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.true;
                        });

                        it('should bail when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        });
                    });

                    describe('and does not equal the entry module', function() {
                        var entryModuleDifferent = Injector.getSubject('test-circular-entry');

                        it('should not bail for any depth', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.true;
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.true;
                        });
                    });
                });

                describe('when it is intercepted', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'is').returns(false).withArgs(States.INTERCEPTED).returns(true);
                    });

                    afterEach(function() {
                        subject.state.is.restore();
                    });

                    describe('and equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should not bail when the depth is 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.true;
                        });

                        it('should bail when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        });
                    });

                    describe('and does not equal the entry module', function() {
                        var entryModuleDifferent = Injector.getSubject('test-circular-entry');

                        it('should not bail for any depth', function() {
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.true;
                            expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.true;
                        });
                    });
                });

                describe('when it is loaded', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'is').returns(false).withArgs(States.LOADED).returns(true);
                    });

                    afterEach(function() {
                        subject.state.is.restore();
                    });

                    it('should bail for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = Injector.getSubject('test-circular-entry');

                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleSame, 4)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 0)).to.be.false;
                        expect(CircularTraverser.onEnter(subject, entryModuleDifferent, 4)).to.be.false;
                    });
                });

                describe('when it is aborted', function() {
                    beforeEach(function() {
                        sinon.stub(subject.state, 'is').returns(false).withArgs(States.ABORTED).returns(true);
                    });

                    afterEach(function() {
                        subject.state.is.restore();
                    });

                    it('should bail for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = Injector.getSubject('test-circular-entry');

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
                var subject = Injector.getSubject('test-circular');

                describe('and given a starting list', function() {
                    var list = ['test'];

                    it('should prepend the name of the subject to the list for any depth and entry module', function() {
                        var entryModuleSame = subject,
                            entryModuleDifferent = Injector.getSubject('test-circular-entry'),
                            expected = new Result([subject.name].concat(list), true);

                        expect(CircularTraverser.onLeave(subject, entryModuleSame, 0, list)).to.deep.equal(expected);
                        expect(CircularTraverser.onLeave(subject, entryModuleSame, 4, list)).to.deep.equal(expected);
                        expect(CircularTraverser.onLeave(subject, entryModuleDifferent, 0, list)).to.deep.equal(expected);
                        expect(CircularTraverser.onLeave(subject, entryModuleDifferent, 4, list)).to.deep.equal(expected);
                    });
                });

                describe('and given no starting list', function() {
                    var list = null;

                    describe('when it equals the entry module', function() {
                        var entryModuleSame = subject;

                        it('should create no list when the depth is 0', function() {
                            expect(CircularTraverser.onLeave(subject, entryModuleSame, 0, list)).to.deep.equal(new Result(list));
                        });

                        it('should create a list containing the subject when the depth is bigger than 0', function() {
                            expect(CircularTraverser.onLeave(subject, entryModuleSame, 4, list)).to.deep.equal(new Result([subject.name], true));
                        });
                    });

                    describe('when it does not equal the entry module', function() {
                        var entryModuleDifferent = Injector.getSubject('test-circular-entry');

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
